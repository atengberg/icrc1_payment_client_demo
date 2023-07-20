import { useLocation, useNavigate } from "react-router-dom";
import SendPaymentForm from "../feature/send-payment-form/SendPaymentForm";
import useCanister from "../feature/canister-provider/useCanister";
import { prepareSendPaymentArgs } from "../utils/utils";

const SendPayment = () => {

  const { 
    canisterMetadata: {
      decimals,
      symbol,
    },
    sourceAddress, 
    createdCount, 
    onDispatchSendPayment, 
  } = useCanister();

  const navigate = useNavigate();

  // Called when UI has validated send payment inputs:
  const onSendPaymentConfirmed = (inputs) => {

    // Create the send_payment args and the view model of the payment used until that call finishes
    // (or the next time get_account_payments updates the payments view model):
    const {
      payment,
      args
    } = prepareSendPaymentArgs({
      inputs,
      decimals,
      sourceAddress,
      createdCount
    });
    // Updated the UI with the pending payment 
    // and dispatch the call to the canister:
    onDispatchSendPayment(args, payment);
    // Make sure the navigation is enqueued afterwards:
    setTimeout(() => {
      navigate('/payments', { replace: true });
    }, 11);
  };

  const { state } = useLocation();
  const { copy } = state ?? { amount: undefined, description: undefined, recipientAddress: undefined };

  return ( 
    <div className="scrollable">
      <SendPaymentForm 
        initialValues={{...copy}}
        onSendPaymentConfirmed={onSendPaymentConfirmed}
        decimals={decimals}
        tokenSymbol={symbol}
      />
    </div>
  );
};

export default SendPayment;
