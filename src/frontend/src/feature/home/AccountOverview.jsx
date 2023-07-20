import QRCode from "react-qr-code";
import { RiClipboardFill } from "../../components/Icons";
import { fromBaseUnits, convertExponetialIntoStringWithAllPlaceholderZeros } from "../../utils/utils";

// Todo encapsulate 'utils' functionality as view model presentation transforms.

const AccountOverview = ({ 
  createdCount, 
  accountAddress, 
  currentBalanceBaseUnits, 
  metadata 
}) => {
  const {
    decimals = null,
    symbol = null,
  } = metadata;

  let balanceDisplay = "Current account balance not available yet";
  if (currentBalanceBaseUnits && currentBalanceBaseUnits > 0) {
    balanceDisplay = convertExponetialIntoStringWithAllPlaceholderZeros(fromBaseUnits(currentBalanceBaseUnits, decimals));
    balanceDisplay = symbol ? `${balanceDisplay} ${symbol}` : balanceDisplay;
  } else if (`${currentBalanceBaseUnits}` === "0") {
    balanceDisplay = `Current account balance is zero. Deposit ${symbol} into this account's address to get started!`;
  }

  let countDisplay = null;
  if (createdCount && createdCount > 0) {
    countDisplay = `Total number of all payments created by this account address:  ${createdCount}`;
  } else if (`${createdCount}` === '0') {
    countDisplay = `Zero payments created so far.`;
  };

  let qrEncoded = "";
  if (symbol && accountAddress) {
    qrEncoded = `${symbol}:${accountAddress}`
  } else if (accountAddress) {
    qrEncoded = `${accountAddress}`;
  } else {
    qrEncoded = null;
  };
  
  // Could add more (number of pending/error/succcess, total paid, total received, etc...);
  return (
    <section aria-labelledby="md-header" 
      className="general-list-section-container"
    >
      <div className="rounded-opaque p-4">
        <header id="md-header" name="md-header" className="themed-container-header">
          Account Overview
        </header>
        <div className="mt-2 flex flex-col gap-2 sm:mt-3 xl:mt-6">
          <div className="general-list-element-content-container">
            <span className="select-none font-bold capitalize italic">Account Address</span>
            <div className="general-list-element-content-content" title="Credit your account by depositing into this address">
              <QrCodeEncodedAddress qrEncoded={qrEncoded} />
              <div className="relative">
                <button className="payment-description-copy-address-button -mt-8 xl:-mt-10"
                  aria-labelledby="copy-address-label-account" title="Copy account address to clipboard" 
                  onClick={() => navigator.clipboard.writeText(accountAddress)}
                >
                  <label className="sr-only" name="copy-address-label-account" id="copy-address-label-account">
                    copy the account address to the clipboard
                  </label>
                  <RiClipboardFill className="stylish-label-icon-size"/>
                </button>
              </div>
              <span className="font-address">{accountAddress}</span>
            </div>
          </div>
          <div className="general-list-element-content-container">
            <span className="select-none font-bold capitalize italic">Current Balance</span>
            <div className="general-list-element-content-content">
              {balanceDisplay}
            </div>
          </div>
          {countDisplay 
            ? <>
              <div className="general-list-element-content-container">
                <span className="select-none font-bold capitalize italic">Number of Payments Made</span>
                <div className="general-list-element-content-content">
                  {countDisplay}
                </div>
              </div>
              </> 
            : null
          }
        </div>
      </div>
    </section>
  );
};

const QrCodeEncodedAddress = ({ qrEncoded = null }) => {
  if (!qrEncoded) {
    return null;
  } else {
    return (
      <div className="flex h-[18rem]  w-full flex-col items-center justify-center pr-2.5 sm:pr-4 lg:pr-6">
        <QRCode value={qrEncoded} size={256} />
      </div>
    )
  }
};

export default AccountOverview;