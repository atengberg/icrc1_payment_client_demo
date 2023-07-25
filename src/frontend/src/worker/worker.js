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
  console.info(`WebWorker::self.onmessage() data ${JSON.stringify({ data , key, args })}`)
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
    case actionTypes.QUERY: 
      switch (key) {
        case stateKeys.canisterMetadata: {
          const call = async () => {
            queryCanister({
              anonymous: true,
              method: 'get_icrc1_token_canister_metadata',
              key,
              responseHandler: parseTokenCanisterMetadataResponse
            });
          }
          Promise.all([ call(), checkCache({ key }) ]);
          return;
        };
        case stateKeys.accountStateSync: 
          Promise.all([ 
            pollingCall(), 
            checkCache({ key: stateKeys.accountPayments }),
            checkCache({ key: stateKeys.accountBalance })
          ]);
          //syncTimer = setInterval(() => syncCall(args?.testing), pollPeriodMs);
          return;
      }
      break;
    case actionTypes.UPDATE: {
      switch (key) {
        case stateKeys.payment: {
          setTimeout(() => {
            sendPaymentCall({ args, key });
          }, (import.meta.env.MODE_IS_TESTING ? 10000 : 0));
          return;
        };
      };
      break;
    };
    case actionTypes.RESET:
      clearInterval(syncTimer);
      syncTimer = null;
      self.close();
      return;
  };
  throw new Error('WebWorker::handlemessage called without an agreeable type or key!' + JSON.stringify({ type, key, args }));
}

// Mostly naive caching in indexdb (key is concatenated with caller's principal).
async function checkCache({ key }) {
  if (import.meta.env.MODE_IS_TESTING) return;
  const { get } = await import("idb-keyval");
  const cached = await get(key);
  if (cached) {
    const result = JSON.parse(cached);
    self.postMessage({ type: actionTypes.VALUE, key, payload: { ...result.ok }});
  }
};

async function queryCanister({ 
  anonymous, 
  method,
  key,
  responseHandler,
}) {
  const { actor, principal } = await getActor(anonymous);
  const response = await actor[method]();
  const result = responseHandler(response);
  if (result?.ok) {
    self.postMessage({ type: actionTypes.VALUE, key, payload: { ...result.ok }});
  } else {
    self.postMessage({ type: actionTypes.ERROR, key, payload: { ...result.err }});
  }
  // Stow in the cache if indexdb is available.
  if (!import.meta.env.MODE_IS_TESTING) {
    const { set } = await import("idb-keyval");
    await set(`key-${principal}`, JSON.stringify(result));
  }
};

async function pollingCall() {
  Promise.all([
    queryCanister({
      anonymous: false,
      method: 'get_account_balance',
      key: stateKeys.accountBalance,
      responseHandler: parseAccountBalanceResponse
    }),
    queryCanister({
      anonymous: false,
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
  self.postMessage({ type: actionTypes.UPDATE, key, payload: { payment }});
  if (result?.err) {
    setTimeout(() => {
      self.postMessage({ type: actionTypes.ERROR, key, payload: { ...result.err } });
    }, 11);
  };
};

self.addEventListener("error", e => {
  //const { lineno, filename, message } = e;
  console.error(`webworker error ${JSON.stringify(e)}`);
  throw e;
});