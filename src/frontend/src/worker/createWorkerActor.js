import { Actor, HttpAgent } from "@dfinity/agent";
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { idlFactory } from '../../../declarations/backend/backend.did.js';

//https://github.com/dfinity/agent-js/blob/main/packages/identity/src/identity/ed25519.ts
function fromHexString(hexString)  {
  return new Uint8Array((hexString.match(/.{1,2}/g) ?? []).map(byte => parseInt(byte, 16))).buffer;
}

async function getActor(anonymous = false) {
  const canisterId = import.meta.env.CANISTER_ID_BACKEND;
  const identity = anonymous ? null : await getIdentity_();
  if (!anonymous && !identity) {
    return;
  }
  const isProduction = (import.meta.env.DFX_NETWORK === 'ic');
  const host = isProduction ? `https://icp0.io` : `http://127.0.0.1:4943`;
  const agent = new HttpAgent({
    identity, 
    host
  });
  if (!isProduction) {
    try {
      await agent.fetchRootKey();
    } catch (e) {
      console.warn("Unable to fetch root key. Check to ensure that your local replica is running!");
      console.error(e);
      throw new Error(e);
    }
  };
  return Actor.createActor(idlFactory, { agent, canisterId });
};

async function getIdentity_() {
  if (import.meta.env?.MODE_IS_TESTING) {
    return Ed25519KeyIdentity.fromKeyPair(
      fromHexString("52EF30BF9E412A693D644AEBE8E22DE574759291065DC392382D4E633AC0C2E9"),
      fromHexString("3771C1F078763EB5AA8561F642A82BD6F6D4F53DE06F5CE07410FC64E765427552EF30BF9E412A693D644AEBE8E22DE574759291065DC392382D4E633AC0C2E9"))
  } else {
    const { AuthClient } = await import("@dfinity/auth-client");
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
};

export default getActor;