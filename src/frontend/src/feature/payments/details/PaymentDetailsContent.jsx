import clsx from "clsx";

import DataTitle from "./DataTitle";
import { 
  getTextStatusColor, 
  convertExponetialIntoStringWithAllPlaceholderZeros, 
  fromBaseUnits, 
  isNonTrivialString, 
  getStatusMessage,
  getDisplayDateStrings
} from "../../../utils/utils";

import { 
  RiAlertFill, 
  RiShieldCheckFill, 
  RiTimeFill, 
  RiFingerprint2Fill, 
  RiFileEditFill, 
  RiScales2Fill, 
  RiCoinFill, 
  RiWallet3Fill, 
  RiLoopRightFill, 
  RiClipboardFill
} from '../../../components/Icons';

import { statusEnum } from "../../../utils/enums.js";

const PaymentDetailsContent = ({ payment, decimals, tokenSymbol, logo = null }) => {
  const {
    id, 
    number,
    creationTimestamp,
    amountBaseUnits, 
    status, 
    description, 
    recipientAddress 
  } = payment;

  const { dayMonthYear, hourMinute } = getDisplayDateStrings(creationTimestamp);

  const normalUnits = convertExponetialIntoStringWithAllPlaceholderZeros(fromBaseUnits(amountBaseUnits, decimals));

  const hasDescription = isNonTrivialString(description);
  const statusColor = getTextStatusColor(status.type, true);
  const statusMessage = getStatusMessage(status);
  const statusIcon = getStatusIcon(status, statusColor);

  return (
    <div className="rounded-opaque container-content-width text-2xl">
      <dl className="flex flex-col">
        <DataTitle 
          ariaId="dt-label-idcount" 
          titleText="Payment Id"  
          icon={<RiFingerprint2Fill className="stylish-label-icon-size" />} 
        />
        <dd className="flex items-center">
          <span className="font-address">{`${id}`}</span>
          <div className="grow"></div>
          <span className="whitespace-nowrap">{`(# ${number})`}</span>
        </dd>
   
        <DataTitle 
          ariaId="dt-label-createdtime" 
          titleText="Created On"  
          icon={<RiTimeFill className="stylish-label-icon-size"  />} 
        />
        <dd >{`${hourMinute} ${dayMonthYear}`}</dd>
      
        <DataTitle 
          ariaId="dt-label-status" 
          titleText="Status" 
          icon={statusIcon} 
        />
        <dd ><span className={statusColor}>{statusMessage}</span></dd>
       
        {hasDescription 
          ? <>
            <DataTitle 
              ariaId="dt-label-desc" 
              titleText="Description" 
              icon={<RiFileEditFill className="stylish-label-icon-size" />} 
            />
            <dd>{description}</dd>
            </>
          : null
        }
  
        <DataTitle 
          ariaId="dt-label-address" 
          titleText="Recipient Address" 
          icon={<RiWallet3Fill className="stylish-label-icon-size"  />} 
        />
        <div className="relative">
          <dd className="font-address break-all pr-8">{recipientAddress}</dd>
          <button className="payment-description-copy-address-button"
            aria-labelledby="copy-address-label" title="Copy recipient address to clipboard" 
            onClick={() => navigator.clipboard.writeText(recipientAddress)}
          >
            <label className="sr-only" name="copy-address-label" id="copy-address-label">
              copy the recipient address to the clipboard
            </label>
            <RiClipboardFill className="sr-hidden stylish-label-icon-size"/>
          </button>
        </div>

        <DataTitle 
          ariaId="dt-label-amount" 
          titleText="Amount"   
          icon={<RiScales2Fill className="stylish-label-icon-size" />} 
        />
        <dd >{`${normalUnits} (equivalent to ${BigInt(amountBaseUnits).toLocaleString()} base units)`}</dd>
       
        <DataTitle 
          ariaId="dt-label-token" 
          titleText="Token"  
          icon={<RiCoinFill className="stylish-label-icon-size"  />} 
        />
        <dd className="flex items-center uppercase">
          { logo ? <img className="mr-2 h-8 w-8" src={logo} /> : null }  
          <span className="tracking-[.075rem]">{tokenSymbol}</span>
        </dd>
      </dl>
    </div>
  )
};

function getStatusIcon(status, statusColor) {
  switch (status.type) {
    case statusEnum.CONFIRMED:
      return <RiShieldCheckFill className={clsx("stylish-label-icon-size", statusColor)} />;
    case statusEnum.FAILED_INTERCANISTER_CALL:
    case statusEnum.FAILED_INVALID_ADDRESS:
    case statusEnum.FAILED_TRANSFER_ERR:
      return  <RiAlertFill className={clsx("stylish-label-icon-size", statusColor)} />;
    case statusEnum.PENDING:
      return (
        <div className="animate-spin">
          <RiLoopRightFill className={clsx("stylish-label-icon-size", statusColor)} />
        </div>
      );
    default:
      throw new Error("Tried to get status icon without a status!");
  }
}

export default PaymentDetailsContent;