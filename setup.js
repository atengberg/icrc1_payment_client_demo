#!/usr/bin/env zx
import 'zx/globals'
import { oneLine } from 'common-tags';
import { spawnSync } from 'child_process';
import { decodeIcrcAccount } from '@dfinity/ledger';
import { uint8ArrayToHexString, encodeBase32 } from '@dfinity/utils';
import dotenv from 'dotenv';
import {
  checkFilesExists, 
  zxRaw, 
  restartDfxBackgroundClean, 
  getCurrentDfxIdPrincipal,
  getCanisterId,
  getICRC1TokenCanisterDfxDeploymentCmd,
  getICRC1TransferDfxCmd,
} from './script-utils.js';

dotenv.config();

async function run(testing = false) {

  await restartDfxBackgroundClean();

  if (!checkFilesExists([ './src/icrc1-token-canister/icrc1.wasm', './src/icrc1-token-canister/icrc1.did' ])) {
    await $`./src/icrc1-token-canister/install.sh`;
  };

  // Create all the canisters in order so ids are recreated the same. 
  await $`dfx canister create icrc1_token_canister`;
  await $`dfx canister create internet_identity`;
  await $`dfx canister create backend`;
  await $`dfx canister create frontend`;

  const currentPrincipal = await getCurrentDfxIdPrincipal();
  try {
    await zxRaw(getICRC1TokenCanisterDfxDeploymentCmd({
      mintersPrincipal: currentPrincipal,
      dfxJsonIcrc1CanisterName: "icrc1_token_canister",
      tokenName: "CVC ICRC1 Mock Token", 
      tokenSymbol: "CVCMICRC1"
    }));
  } catch (p) {
    throw new Error(`While deploying icrc1 token canister caught error ${p.toString()}`);
  };

  const icrc1TokenCanisterId = await getCanisterId("icrc1_token_canister");

  try {
    await $`dfx deploy internet_identity`
  } catch (p) {
    throw new Error(`While deploying internet_identity canister caught error ${p.toString()}`);
  };

  try {
    await $`dfx deploy backend`
    await $`dfx generate backend`
    await $`dfx canister call backend set_icrc1_token_canister '( "${icrc1TokenCanisterId}" )'`;
  } catch (p) {
    throw new Error(`While deploying and generating backend canister caught error ${p.toString()}`);
  };

  try {
    await $`dfx deploy frontend`
  } catch (p) {
    throw new Error(`While deploying frontend canister caught error ${p.toString()}`);
  };

  // Credit initial balance of current dfx identity's subaccount:
  try {
    // Get the address, returned through stdout with zx. 
    // Good example of limits of this approach (easier to just use agent-js at some point).
    const { stdout } = await $`dfx canister call backend get_account_address`;
    // Parse the address's literal value:
    const accountAddress = stdout.substring(stdout.indexOf(`= "`) + 3, stdout.lastIndexOf(`";`))
    // Decode the ICRC1 account and initiate the transfer, crediting the account:
    zxRaw(getICRC1TransferDfxCmd({ account: decodeIcrcAccount(accountAddress) }));
  } catch (e) {
    throw new Error(`While transferring to current user's subaccount, caught error ${e.toString()}`);
  };

  if (testing) {
    // nns ed25519:
    const testAccountAddressA = "be2us-64aaa-aaaaa-qaabq-cai-mnnzrpq.4e9ece1d5903f7a012e4d6e98ec262de481149dfa156812985b6362b1795b69a";
    // nns secp256k:
    const testAccountAddressB = "be2us-64aaa-aaaaa-qaabq-cai-dwuxpki.ad051cbaf8f18cdce6e4fae39791a0415182fdf25387f099f180228c08c9cb0d";
    const accountA = decodeIcrcAccount(testAccountAddressA)
    const accountB = decodeIcrcAccount(testAccountAddressB);
    try {
      zxRaw(getICRC1TransferDfxCmd({ account: accountA }));
      zxRaw(getICRC1TransferDfxCmd({ account: accountB }));
    }  catch (p) {
      throw new Error(`While transfering funds to test accounts ${p.toString()}`);
    };  
  };
};

await run(argv.testing === true);
