import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useCanister from "../feature/canister-provider/useCanister";
import PaymentDetailsContent from "../feature/payments/details/PaymentDetailsContent";

const PaymentDetails = () => {
  const [payment, setPayment] = useState(null);
  const navigate = useNavigate();
  const { id: clientPaymentId } = useParams();

  const { 
    getPaymentById, 
    canisterMetadata: { 
      decimals, 
      symbol,
      logo = null
    } = {} 
  } = useCanister();

  useEffect(() => {
    const p = getPaymentById(clientPaymentId);
    p ? setPayment(() => p) : navigate('/');
  }, [getPaymentById, clientPaymentId, navigate]);

  if (!payment || !decimals) {
    return null;
  };

  return (
    <section className="scrollable" aria-labelledby="label-payment-details-page">
      <label className="sr-only" name="label-payment-details-page" id="label-payment-details-page">payment details page</label>
      <PaymentDetailsContent payment={payment} tokenSymbol={symbol} decimals={decimals} logo={logo} />
    </section>
  )
};

export default PaymentDetails;
 
