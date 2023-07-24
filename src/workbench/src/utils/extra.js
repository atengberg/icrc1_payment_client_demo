import { encodeIcrcAccount } from '@dfinity/ledger';
import { Principal } from '@dfinity/principal';

/** Returns the set of all ICRC1 account encoded addresses with incrementing subaccount length (starting from 0);
 * that is, the index of the returned array corresponds to that index's address's encoded subaccount length (to 64). */
function generateIncrementedLengthICRC1EncodedAddresses() {
  const owner = Principal.fromText('k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae');
  const addresses = [encodeIcrcAccount({ owner })];
  for (let i = 1; i < 65; ++i) {
    const subaccount = new Uint8Array(32);
    const even = i % 2 === 0;
    let factor = i > 1 ? even ? (i / 2) : ((i - 1) / 2) : 0;
    let u = 0;
    while (u < factor) {
      // So each address is visually distinct (apart from length):
      subaccount[u] = ((128 + u + i) % 255) + 1;
      ++u;
    }
    if (!even) {
      subaccount[factor] = 1;
    }
    subaccount.reverse();
    addresses[i] = encodeIcrcAccount({ owner, subaccount });
  };
  // In case the ellipsized including char count values need to change. 
  return addresses;
};

export { generateIncrementedLengthICRC1EncodedAddresses } 