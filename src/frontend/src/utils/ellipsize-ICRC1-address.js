/****Ellipsize ICRC1 address text.**
 * @param {string} address - The address text to ellipsize. 
 * @param {number} [includedCharacterCount=5] - How many leading and trailing characters to include, defaults to 5 always prefixed and suffixed if no subaccount; if there is a subaccount, the subaccount if its length < 9 or first 3 chars and last 5 chars of subaccount if greater than 9. 
 * @returns {string} The ellipsized ICRC1 address text.
 * 
 * @example ellipsizeICRC1Address("k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae") -> "k2t6j...6ae"  
 * @example ellipsizeICRC1Address("k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae.1") -> "k2t6j...6ae.1"  
 * @example ellipsizeICRC1Address("k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6aedfxgiyy.1020304050607") -> "k2t6j...6ae.1020304050607"  
 * @example ellipsizeICRC1Address("k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae-dfxgiyy.102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20") -> "k2t6j...dfxgiyy.10203...e1f20"  
 */
const ellipsizeICRC1Address = (address, includedCharacterCount) => {
  // characters to include...
  const includedCharCount = includedCharacterCount ?? 5;
  // Arbitrarily decided if subaccount, only need first three but this is set here:
  const leadingSubaccountCharCount = 3;
  if (typeof address === 'string' && address.trim().length > 0) {
    const leading = address.slice(0, includedCharCount) + '...';
    const trailing = () => {
      const lastHyphenIndex = address.lastIndexOf('-') + 1;
      const index = address.indexOf('.');
      if (index > -1) {
        const checksum = address.slice(lastHyphenIndex, index);
        const subaccount = address.slice(index);
        // - 2 for count less the .
        return (((subaccount.length - 2) <= (leadingSubaccountCharCount + includedCharCount)) 
          ? address.slice(lastHyphenIndex) 
          : `${checksum}${subaccount.slice(0,(leadingSubaccountCharCount + 1))}...${subaccount.slice(-includedCharCount)}`);
      } else {
        return address.slice(lastHyphenIndex);
      }
    }
    return `${leading}${trailing()}`
  } else {
    throw new Error(`Passed an invalid arg to ellipsize as an icrc1 address!: ${JSON.stringify({address})}`)
  }
}

export default ellipsizeICRC1Address;