/****Ellipsize ICRC1 address text.**
 * @param {string} address - The address text to ellipsize. 
 * @returns {string} The ellipsized ICRC1 address text.
 * 
 * @example ellipsizeICRC1Address("k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae") -> "k2t6j...6ae"  
 * @example ellipsizeICRC1Address("k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae-pscseiy.1") -> "k2t6j...pscseiy.1"  
 * @example ellipsizeICRC1Address("k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae-dfhypjy.1234567809") -> "k2t6j...dfhypjy.1234567809"  
 * @example ellipsizeICRC1Address("k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae-3l7u4da.12345678900a") -> "k2t6j...3l7u4da.123...8900a"
 * @example ellipsizeICRC1Address("k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae-dfxgiyy.102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20") -> "k2t6j...dfxgiyy.102...e1f20"   
 */
const ellipsizeICRC1Address = (address) => {
  if (!address || typeof(address) !== 'string' || address.length === 0) {
    throw new Error(`Param address ${JSON.stringify({ address })} is not valid ICRC1 account encoded text`);
  } else {
    /// How many chars to include as the prefix and suffix (if ellipsizing the subaccount, or just of the owner's principal):
    const leadingTrailingCharCount = 5;
    // How many chars to include from the beginning of the subaccount (if ellipsizing the subaccount):
    const subPrefixChars = 3;
    // The first 5 characters of the address:
    const leadingChars = address.slice(0, leadingTrailingCharCount);
    const lastHyphenIndex = address.lastIndexOf('-');
    // Index of subaccount concatenator: 
    const subDotIndex = address.indexOf('.');
    if (subDotIndex > -1) {
      // There is a subaccount so check if subaccount is shorter than the length of an ellipsized subaccount:
      const subaccount = address.slice(subDotIndex);
      if ((subaccount.length - 1) > (subPrefixChars + 3 /* ... */ + leadingTrailingCharCount)) {
        // Subaccount length is not shorter, so return ellipsizing both the owner's principal and subaccount text:
        return `${leadingChars}...${address.slice((lastHyphenIndex + 1), (subDotIndex + (subPrefixChars + 1)))}...${subaccount.slice(-leadingTrailingCharCount)}`;
      } // Else just return the entire "short" subaccount (same as if ellipsizing just the owner's principal text). 
    } 
    return `${leadingChars}...${address.slice(lastHyphenIndex + 1)}`;
  }
}

export default ellipsizeICRC1Address;