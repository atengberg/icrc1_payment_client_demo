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

function fromHexString(hexString)  {
  return new Uint8Array((hexString.match(/.{1,2}/g) ?? []).map(byte => parseInt(byte, 16))).buffer;
}

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

const identityEd25 = Ed25519KeyIdentity.fromKeyPair(
  fromHexString("52EF30BF9E412A693D644AEBE8E22DE574759291065DC392382D4E633AC0C2E9"),
  fromHexString("3771C1F078763EB5AA8561F642A82BD6F6D4F53DE06F5CE07410FC64E765427552EF30BF9E412A693D644AEBE8E22DE574759291065DC392382D4E633AC0C2E9")
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
