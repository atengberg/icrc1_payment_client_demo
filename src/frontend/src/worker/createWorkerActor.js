import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from '../../../declarations/backend/backend.did.js';
import fetch from 'isomorphic-fetch';

async function getActor(identity) {
  const canisterId = import.meta.env.CANISTER_ID_BACKEND;
  const isProduction = (import.meta.env.DFX_NETWORK === 'ic');
  const host = isProduction ? `https://icp0.io` : `http://127.0.0.1:4943`;
  const agent = new HttpAgent({
    identity, 
    host,
    fetch
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


export default getActor;