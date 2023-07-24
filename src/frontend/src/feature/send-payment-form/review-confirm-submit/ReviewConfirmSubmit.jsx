import { useMemo } from 'react';
import { RiCheckDoubleFill, RiErrorWarningFill, RiShieldFill } from '../../../components/Icons';
import FormLabel from "../FormLabel";
import InputsReview from './InputsReview';

const ReviewConfirmSubmit = ({
  amount,
  description,
  address,
  decimals,
  tokenSymbol = "icrc1 token",
  hasError,
  disabled,
}) => {

  const hasAddress = !!address;
  const hasAmount = !!amount;
  const hasDescription = !!description;
  const hasInput = hasAddress || hasAmount || hasDescription;

  const formIcon = useMemo(() => (
    hasInput 
      ? hasError 
        ? <RiErrorWarningFill className="stylish-label-icon-size text-e8-razzmatazz" /> 
        : <RiCheckDoubleFill  className="stylish-label-icon-size text-u-green-success" /> 
    : <RiShieldFill  className="stylish-label-icon-size themed-font-text" />
  ), [hasError, hasInput]);

  return useMemo(() => (
    <div>
      <FormLabel 
        htmlFor="confirm-send-payment-button"  
        labelText="review and confirm" 
        icon={formIcon} 
      />
      <Content 
        decimals={decimals}
        amount={amount}
        description={description}
        address={address}
        tokenSymbol={tokenSymbol}
        disabled={disabled}
        hasError={hasError}
        hasInput={hasInput}
      />
    </div>
  ), [
    decimals,
    amount,
    description,
    address,
    tokenSymbol,
    hasError,
    disabled,
    formIcon,
    hasInput
  ])
};

const Content = ({
  hasInput,
  amount,
  address,
  description,
  disabled,
  hasError,
  decimals,
  tokenSymbol,
}) => {
  return useMemo(() => {
    if (hasError) {
      return (
        <div  className="error-status-layout-container">
          <span className="font-semibold">Cannot initiate sending payment when there is any error</span>
        </div>
      );       
    } else {
      if (hasInput) {
        return (
          <FormReviewSubmission 
            amount={amount} 
            address={address} 
            decimals={decimals}
            tokenSymbol={tokenSymbol} 
            description={description} 
            disabled={disabled} 
          />
        )
      } else {
        return (
          <div className="input-unspecified-font m-xl:py-4 flex w-full flex-col items-center justify-center  py-2 sm:py-8">
            <span>waiting for user input</span>
          </div>
        )
      }
    }
  }, [
    decimals,
    hasInput,
    amount,
    address,
    description,
    disabled,
    hasError,
    tokenSymbol
  ])
};

const FormReviewSubmission = ({ 
  amount, 
  decimals, 
  address, 
  description, 
  tokenSymbol, 
  disabled 
}) => {
  return useMemo(() => (
    <div className="input-content m-xl:px-3 px-2 pb-12 pt-4 sm:px-4 lg:px-6 xl:px-8"> 
      <InputsReview
        amount={amount}
        address={address}
        description={description}
        decimals={decimals}
        tokenSymbol={tokenSymbol}
      />
      <div className="mt-8 flex flex-col items-center justify-center gap-4">
        <span className="confirm-sumbit-button-label px-[5%]">
          {`To proceed to send payment press 'Send Payment' below:`}
        </span>
        <button 
          type="submit"
          id="confirm-send-payment-button" name="confirm-send-payment-button"
          disabled={disabled}
          className="stylish-button confirm-submit-button"
        >
          <span className="text-u-snow">Send Payment</span>
        </button>
      </div>
    </div>
  ), [
    decimals,
    amount, 
    address, 
    description, 
    tokenSymbol, 
    disabled, 
  ]);
};


export default ReviewConfirmSubmit;