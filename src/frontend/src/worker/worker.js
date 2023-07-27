// Required to polyfill BigInt since Nats must be serialized (good reason for using Typescript instead...):
BigInt.prototype.toJSON = function () { return this.toString(); };

import { AuthClient } from "@dfinity/auth-client"; 
import { actionTypes, stateKeys } from "../utils/enums.js";
import { 
  handleMessage, 
  setUiCallback, 
} from "./utils.js";

self.addEventListener("message", onMessage);
setUiCallback(args => self.postMessage(args));

async function onMessage ({ data }) {
  const { type, key, args = null } = data;
  //console.info(`WebWorker::self.onmessage() data ${JSON.stringify({ data , key, args })}`)
  try {
    // Since AuthClient not available in testing, pass the identity to the testable utils:
    let identity = null;
    if (type === actionTypes.STOP || type === actionTypes.RESET) {
      // Do nothing since no identity required.
    } else {
      if (key === stateKeys.accountStateSync || key === stateKeys.payment) {
        const id = await getIdentity();
        if (!id) {
          // Not authenticated so no point in processing. 
          return;
        } else {
          identity = id;
        }    
      }
    }
    handleMessage({ type, key, args, identity });
    if (type === actionTypes.RESET) {
      setUiCallback(null);
      self.close();
    }
  } catch (e) {
    console.error("caught web worker error")
    console.log(e)
  }
};

async function getIdentity() {
  const authClient = await AuthClient.create({
    idleOptions: {
      disableIdle: true,
      disableDefaultIdleCallback: true,
    }
  });
  const isAuthenticated = await authClient.isAuthenticated();
  if (!isAuthenticated) {
    return;
  }
  return authClient.getIdentity();
}

self.addEventListener("error", e => {
  //const { lineno, filename, message } = e;
  console.error(`webworker error ${JSON.stringify(e)}`);
  throw e;
});

