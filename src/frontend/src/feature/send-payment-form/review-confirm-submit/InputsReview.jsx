import { useMemo } from "react";
import { fromBaseUnits, toBaseUnits, convertExponetialIntoStringWithAllPlaceholderZeros } from "../../../utils/utils";

// Todo encapsulate 'utils' functionality as view model presentation transforms.

const InputsReview = ({
  amount,
  description,
  address,
  tokenSymbol,
  decimals
}) => {
  return useMemo(() => {
    const pAmount = parseFloat(amount);
    const hasNonZeroAmount = amount && pAmount > 0;
    const hasAddress = address && address?.length > 0;
    const hasNonEmptyDescription = description && description?.length > 0;
    const unitsIsNormal = hasNonZeroAmount && amount.includes('.');

    // Will always show the expected in normal units but with base units equivalent, ie:
    //  User is sending
    //    1.1 <ICRC1 token symbol> (equivalent to 1,100,000 base units)
    let dAmount = amount;
    let amountQualifier = tokenSymbol ? tokenSymbol : '';
    if (amount && amount.length > 0) {
      dAmount = unitsIsNormal ? amount : convertExponetialIntoStringWithAllPlaceholderZeros(fromBaseUnits(amount, decimals));
      let baseUnits = unitsIsNormal ? toBaseUnits(amount, decimals) : amount;
      baseUnits = baseUnits.split('.')[0];
      amountQualifier = `${tokenSymbol} (equivalent to ${BigInt(baseUnits).toLocaleString()} base units)`;
    }
    return (
      <div className="m-xl:mr-4 mr-2 flex flex-col gap-2 pt-2 sm:mr-8">  
        <span className="themed-font-color ml-2 font-extrabold tracking-[.1rem]">User is sending</span>
        <div className="review-indent">
          {hasNonZeroAmount 
            ? <div className="flex items-end">
                <span className="mr-1 tracking-[.1em]">{dAmount}</span>
                <span className="">{amountQualifier}</span>
              </div>
            : <span className="input-unspecified-font">unspecified</span>
          }
        </div>
        <span className="themed-font-color ml-2 font-extrabold tracking-[.1rem]" >to the address</span>
        <div className="review-indent">
          {hasAddress 
              ? <div className="flex items-end break-all">
                  <span className="font-mono tracking-[.1rem]">{address}</span>
                </div>
              : <span className="input-unspecified-font">unspecified</span>
          }
        </div>
        <span className="themed-font-color ml-2 font-extrabold tracking-[.1rem]" >saved with the description</span>
        <div className="review-indent">
          {hasNonEmptyDescription 
            ? <div className="flex items-end break-all">
                <span className="mr-2 tracking-[.1rem]">{description}</span>
              </div>
            : <span className="input-unspecified-font" >
                {`(no description for this payment given)`}
              </span>
          }
        </div>
      </div>
    );}, 
    [
      address, 
      amount, 
      description, 
      decimals,
      tokenSymbol
    ]);
};

export default InputsReview;