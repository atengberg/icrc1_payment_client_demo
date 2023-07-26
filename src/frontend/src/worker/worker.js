// Need to manually polyfill in WebWorker's context to make candid Nat's transferrable.
// Good reason for using Typescript instead...
BigInt.prototype.toJSON = function () { return this.toString(); };
import { actionTypes } from "../utils/enums.js";
// Encapsulated utils so integrated testing can be done:
import { 
  handleMessage, 
  setUiCallback, 
  setCacheCallback 
} from "./utils.js";

self.addEventListener("message", onMessage);
setUiCallback(args => self.postMessage(args));

if (import.meta.env.DISABLE_INDEXEDB) {
  setCacheCallback(args => args);
} else {
  setCacheCallback(args => cache(args));
}

function onMessage ({ data }) {
  const { type, key, args = null } = data;
  handleMessage({ type, key, args });
  if (type === actionTypes.RESET) {
    setUiCallback(null);
    self.close();
  } else if (type === actionTypes.QUERY) {
    const { principal } = args;
    checkCache({ key, principal });
  }
};

// Mostly naive caching in indexdb (key is concatenated with caller's principal).
async function checkCache({ key, principal }) {
  if (import.meta.env.DISABLE_INDEXEDB) {
    return;
  } else {
    const { get } = await import("idb-keyval");
    const cached = await get(getCacheKey({ key, principal }));
    if (cached) {
      const result = JSON.parse(cached);
      self.postMessage({ type: actionTypes.VALUE, key, payload: { ...result.ok }});
    }
  }
};

async function cache({ key, principal, result }) {
  if (import.meta.env.DISABLE_INDEXEDB) {
    return;
  } else {
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

