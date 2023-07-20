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
    <div className="scrollable">
      <PaymentDetailsContent payment={payment} tokenSymbol={symbol} decimals={decimals} logo={logo} />
    </div>
  )
};

export default PaymentDetails;
 
