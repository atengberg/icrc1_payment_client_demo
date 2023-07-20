import { idlFactory as backendIdlFactory } from "../../../declarations/backend/backend.did.js";
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Buffer } from 'buffer';
import fetch from 'isomorphic-fetch';

async function getActor(
  anonymous = false, 
  testing = (import.meta.env.MODE_IS_TESTING || false)
) {
  const getIdentity = async () => {
    if (testing) {
      return Ed25519KeyIdentity.fromKeyPair(
        // One of the ed25519 NNS identities...
        Buffer.from("Uu8wv55BKmk9ZErr6OIt5XR1kpEGXcOSOC1OYzrAwuk=", 'base64'),
        Buffer.from("N3HB8Hh2PrWqhWH2Qqgr1vbU9T3gb1zgdBD8ZOdlQnVS7zC/nkEqaT1kSuvo4i3ldHWSkQZdw5I4LU5jOsDC6Q==", 'base64')
      );
    } else {
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
  return createWorkerActor({ 
    identity: anonymous ? null : await getIdentity()
  });
}

async function createWorkerActor({ 
  canisterId = import.meta.env.CANISTER_ID_BACKEND,
  idlFactory = backendIdlFactory,
  identity = null
} = {}) {
  const isProduction = (import.meta.env.DFX_NETWORK === 'ic');
  const agent = new HttpAgent({
    fetch,
    identity, 
    host: isProduction ? `https://icp0.io` : `http://localhost:4943`
  });
  if (!isProduction) {
    await agent.fetchRootKey().catch((err) => {
      console.warn("Unable to fetch root key. Check to ensure that your local replica is running!");
      console.error(err);
    });
  };
  // To be sure to cache for the correct user.
  const principal = identity ? identity.getPrincipal().toString() : "anon";
  return {
    actor: Actor.createActor(
      idlFactory, {
        agent, 
        canisterId
      },  
    ),
    principal
  }
};

export default getActor;