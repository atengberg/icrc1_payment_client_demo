import initialize from "./init.js";
initialize();

import { Actor, HttpAgent } from "@dfinity/agent";
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import { idlFactory } from "../../../declarations/backend/backend.did.js";
import fetch from 'isomorphic-fetch';
import pemfile from 'pem-file';

const canisterId = process.env.CANISTER_ID_BACKEND
const host = `http://localhost:4943`;

const identitySec256 = (Secp256k1KeyIdentity.fromSecretKey(pemfile.decode(
  `
  -----BEGIN EC PRIVATE KEY-----
  MHQCAQEEICJxApEbuZznKFpV+VKACRK30i6+7u5Z13/DOl18cIC+oAcGBSuBBAAK
  oUQDQgAEPas6Iag4TUx+Uop+3NhE6s3FlayFtbwdhRVjvOar0kPTfE/N8N6btRnd
  74ly5xXEBNSXiENyxhEuzOZrIWMCNQ==
  -----END EC PRIVATE KEY-----
  `.replace(/(\n)\s+/g, '$1'),
    // replace(<regex>) makes template literal multiline to be ok for pemfile.
  ).slice(7, 39))
);

// Copied from https://github.com/dfinity/sdk/blob/master/docs/cli-reference/dfx-nns.md#examples-1
const base64ToUInt8Array = (base64String) => Buffer.from(base64String, 'base64');

const identityEd25 = Ed25519KeyIdentity.fromKeyPair(
  base64ToUInt8Array("Uu8wv55BKmk9ZErr6OIt5XR1kpEGXcOSOC1OYzrAwuk="),
  base64ToUInt8Array("N3HB8Hh2PrWqhWH2Qqgr1vbU9T3gb1zgdBD8ZOdlQnVS7zC/nkEqaT1kSuvo4i3ldHWSkQZdw5I4LU5jOsDC6Q==")
);

async function getActor(identity = Secp256k1KeyIdentity.generate()) {
  const agent = new HttpAgent({
    fetch,
    identity, 
    host
  });
  await agent.fetchRootKey().catch((err) => {
    console.warn("Unable to fetch root key. Check to ensure that your local replica is running!");
    console.error(err);
  });
  return Actor.createActor(idlFactory, {
      agent, 
      canisterId
    }
  );
};

const actorEd25 = await getActor(identityEd25);
const actorSec256 = await getActor(identitySec256);
const anonymousActor = await getActor(null);
const anonymousPrincipal = Principal.anonymous();

const getRandomActor = async () => await getActor();
const getActorByIdentity = async i => await getActor(i);
const getRandomIdentity = () => Secp256k1KeyIdentity.generate();

export {
  actorEd25,
  actorSec256,
  anonymousActor,
  anonymousPrincipal,
  getRandomActor,
  getActorByIdentity,
  getRandomIdentity,
};
