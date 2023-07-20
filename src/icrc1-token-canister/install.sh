if [ -f "./src/icrc1-token-canister/icrc1.wasm" ]; then
  echo "icrc1 wasm already exists, not downloading again!";
  exit;
fi

export IC_VERSION=b9d14e71b857ceca7087b31f5a32618d25555f29
curl -o ./src/icrc1-token-canister/icrc1.wasm.gz "https://download.dfinity.systems/ic/$IC_VERSION/canisters/ic-icrc1-ledger.wasm.gz"
curl -o ./src/icrc1-token-canister/icrc1.did "https://raw.githubusercontent.com/dfinity/ic/$IC_VERSION/rs/rosetta-api/icrc1/ledger/ledger.did"
gunzip ./src/icrc1-token-canister/icrc1.wasm.gz