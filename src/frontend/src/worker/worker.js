// Need to manually polyfill in WebWorker's context to make candid Nat's transferrable.
// Good reason for using Typescript instead...
BigInt.prototype.toJSON = function () { return this.toString(); };

import getActor  from "./createWorkerActor.js";
import { stateKeys, actionTypes } from "../utils/enums.js";
import {
  parseAccountBalanceResponse,
  parseTokenCanisterMetadataResponse,
  parseAccountPaymentsResponse,
  parsePayment,
} from "../utils/utils.js";

// Could let user set period polling time (along with unit type preference).
const pollPeriodMs = 10000;
let syncTimer;

function onMessage ({ data }) {
  const { type, key, args = null } = data;
  handleMessage({ type, key, args });
};

self.addEventListener("message", onMessage);

function handleMessage({
  type,
  key,
  args,
} = {}) {
  console.log(`handleMessage type[${type}]\t\tkey[${key}]\t\t\targs[${args}]`)
  switch (type) {
    case actionTypes.QUERY: {
      // Used to create cache key.
      const { principal } = args;
      switch (key) {
        case stateKeys.canisterMetadata: {
          Promise.all([ 
            queryCanister({
              anonymous: true,
              principal,
              method: 'get_icrc1_token_canister_metadata',
              key,
              responseHandler: parseTokenCanisterMetadataResponse,
            }), 
            checkCache({ key, principal }) 
          ]);
          return;
        };
        case stateKeys.accountStateSync: {
          //syncTimer = setInterval(() => syncCall(args?.testing), pollPeriodMs);
          Promise.all([ 
            checkCache({ key: stateKeys.accountPayments, principal }),
            checkCache({ key: stateKeys.accountBalance, principal }),
            pollingCall(principal),
          ]);
          return;
        };
      }
      break;
    };
    case actionTypes.UPDATE: {
      switch (key) {
        case stateKeys.payment: {
          sendPaymentCall({ args, key });
          return;
        };
      };
      break;;
    };
    case actionTypes.RESET:
      clearInterval(syncTimer);
      syncTimer = null;
      self.close();
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
  if (result?.ok) {
    self.postMessage({ type: actionTypes.VALUE, key, payload: { ...result.ok }});
  } else {
    self.postMessage({ type: actionTypes.ERROR, key, payload: { ...result.err }});
  }
  // Stow in the cache if indexdb is available.
  if (result?.ok) {
    await cacheResult({ key, principal, result })
  }
};

function pollingCall(principal) {
  Promise.all([
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
  const { actor } = await getActor(false);
  const response = await actor.send_payment(args);
  const { result, payment: p } = response;
  const payment = parsePayment(p);
  self.postMessage({ type: actionTypes.UPDATE, key, payload: { payment } });
  if (result?.err) {
    setTimeout(() => {
      self.postMessage({ type: actionTypes.ERROR, key, payload: { ...result.err } });
    }, 11);
  };
};

// Mostly naive caching in indexdb (key is concatenated with caller's principal).
async function checkCache({ key, principal }) {
  if (!import.meta.env?.MODE_IS_TESTING) {
    // Dynamic import used here since idb won't be available in testing.
    const { get } = await import("idb-keyval");
    const cached = await get(getCacheKey({ key, principal }));
    if (cached) {
      const result = JSON.parse(cached);
      self.postMessage({ type: actionTypes.VALUE, key, payload: { ...result.ok }});
    }
  };
};

async function cacheResult({ key, principal, result }) {
  if (!import.meta.env?.MODE_IS_TESTING) {
    const { set } = await import("idb-keyval");
    await set(getCacheKey({ key, principal }), JSON.stringify(result));
  }
};

function getCacheKey({ key, principal }) { return `${key}-${principal}`; }

self.addEventListener("error", e => {
  //const { lineno, filename, message } = e;
  console.error(`webworker error ${JSON.stringify(e)}`);
  throw e;
});