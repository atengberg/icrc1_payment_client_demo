import getActor  from "./createWorkerActor.js";
import { stateKeys, actionTypes } from "../utils/enums.js";
import {
  parseAccountBalanceResponse,
  parseTokenCanisterMetadataResponse,
  parseAccountPaymentsResponse,
  parsePayment,
} from "../utils/utils.js";

let uiCallback;
function setUiCallback(callback) { uiCallback = callback };
let cacheCallback;
function setCacheCallback(callback) { cacheCallback = callback };

// Could let user set period polling time (along with unit type preference).
const pollPeriodMs = 10000;
let syncTimer;

/*
  Important Notice: Returning in these methods is just for the sake of testing, 
  as the webworker uses the postMessage callback to update the state (as opposed
  to awaiting a promise to fullfill).
*/

async function handleMessage({
  type,
  key,
  args,
} = {}) {
  switch (type) {
    case actionTypes.QUERY: {
      // Used to create cache key.
      const { principal } = args;
      switch (key) {
        case stateKeys.canisterMetadata: {
          return await queryCanister({
            anonymous: true,
            principal,
            method: 'get_icrc1_token_canister_metadata',
            key,
            responseHandler: parseTokenCanisterMetadataResponse,
          });
        };
        case stateKeys.accountStateSync: {
          if (import.meta.env.DISABLE_INDEXEDB) {
            // Currently tests do not include polling. 
            syncTimer = setInterval(() => pollingCall(principal, pollPeriodMs));
          }
          return await pollingCall(principal);
        };
      }
      break;
    };
    case actionTypes.UPDATE: {
      switch (key) {
        case stateKeys.payment: {
          return await sendPaymentCall({ args, key });
        };
      };
      break;
    };
    case actionTypes.RESET:
      clearInterval(syncTimer);
      syncTimer = null;
      return;
  };
  throw new Error('WebWorker::handlemessage called without an agreeable type or key!' + JSON.stringify({ type, key, args }));
}

async function queryCanister({ 
  anonymous = false,
  principal,
  method,
  key,
  responseHandler,
}) {
  const actor = await getActor(anonymous);
  const response = await actor[method]();
  const result = responseHandler(response);
  const fr = [];
  if (result?.ok) {
    fr[0] = selfPostMessage({ type: actionTypes.VALUE, key, payload: { ...result.ok }});
    cacheCallback({ key, principal, result });
  } else {
    fr[0] = selfPostMessage({ type: actionTypes.ERROR, key, payload: { ...result.err }});
  }
  return fr;
};

async function pollingCall(principal) {
  return await Promise.all([
    queryCanister({
      principal,
      method: 'get_account_balance',
      key: stateKeys.accountBalance,
      responseHandler: parseAccountBalanceResponse
    }),
    queryCanister({
      principal,
      method: 'get_account_payments',
      key: stateKeys.accountPayments,
      responseHandler: parseAccountPaymentsResponse
    })
  ]);
};

async function sendPaymentCall({ key, args }) {
  const actor = await getActor(false);
  const response = await actor.send_payment(args);
  const { result, payment: p } = response;
  const payment = parsePayment(p);
  const fr = [];
  fr[0] = selfPostMessage({ type: actionTypes.UPDATE, key, payload: { payment } });
  if (result?.err) {
    setTimeout(() => { selfPostMessage({ type: actionTypes.ERROR, key, payload: { ...result.err } }) }, 11);
    fr[1] = { type: actionTypes.ERROR, key, payload: { ...result.err } };
  };
  return fr;
};

function selfPostMessage(args) {
  uiCallback(args);
  // For the sake of testing:
  return (args);
};

export { handleMessage, setUiCallback, setCacheCallback };