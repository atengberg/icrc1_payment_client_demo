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

// Could let user set period polling time (along with unit type preference).
const pollPeriodMs = 10000;
let syncTimer;

/*
  Important Notice: Returning in these methods is just for the sake of testing, 
  as the webworker uses the postMessage callback to update the state (as opposed
  to awaiting a promise to fullfill/returning some value).
*/

async function handleMessage({
  type,
  key,
  args,
  identity
} = {}) {
  switch (type) {
    case actionTypes.QUERY: {
      switch (key) {
        case stateKeys.canisterMetadata: {
          return await queryCanister({
            identity,
            method: 'get_icrc1_token_canister_metadata',
            key,
            responseHandler: parseTokenCanisterMetadataResponse,
          });
        };
        case stateKeys.accountStateSync: {
          // eslint-disable-next-line no-empty
          if (args?.principal === "test-principal-cache-keypart") {
          } else {
            // Currently tests do not include polling. 
            syncTimer = setInterval(() => pollingCall(identity), pollPeriodMs);
          }
          return await pollingCall(identity);
        };
      }
      break;
    };
    case actionTypes.UPDATE: {
      switch (key) {
        case stateKeys.payment: {
          return await sendPaymentCall({ args, key, identity });
        };
      };
      break;
    };
    case actionTypes.STOP:
    case actionTypes.RESET:
      clearInterval(syncTimer);
      syncTimer = null;
      return;
  };
  throw new Error('WebWorker::handlemessage called without an agreeable type or key!' + JSON.stringify({ type, key, args }));
}

async function queryCanister({ 
  identity,
  method,
  key,
  responseHandler,
}) {
  const actor = await getActor(identity);
  if (actor) {
    const response = await actor[method]();
    const result = responseHandler(response);
    const fr = [];
    if (result?.ok) {
      fr[0] = selfPostMessage({ type: actionTypes.VALUE, key, payload: { ...result.ok }});
    } else {
      fr[0] = selfPostMessage({ type: actionTypes.ERROR, key, payload: { ...result.err }});
    }
    return fr;
  } else {
    //console.error(`Had no actor to query for ${key} ${method}`)
  }
};

async function pollingCall(identity) {
  return await Promise.all([
    queryCanister({
      identity,
      method: 'get_account_balance',
      key: stateKeys.accountBalance,
      responseHandler: parseAccountBalanceResponse
    }),
    queryCanister({
      identity,
      method: 'get_account_payments',
      key: stateKeys.accountPayments,
      responseHandler: parseAccountPaymentsResponse
    })
  ]);
};

async function sendPaymentCall({ key, args, identity }) {
  const actor = await getActor(identity);
  if (actor) {
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
  } else {
    //console.error(`Had no actor to send payment`)
  }
};

function selfPostMessage(args) {
  uiCallback(args);
  // For the sake of testing:
  return (args);
};

export { handleMessage, setUiCallback };