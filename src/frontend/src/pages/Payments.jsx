
import useCanister from "../feature/canister-provider/useCanister";
import PaymentsList from "../feature/payments/list/PaymentsList";

const Payments = () => {
  const { canisterMetadata = {}, payments } = useCanister();
  const { decimals = null, symbol = null } = canisterMetadata;
  if (!payments || !decimals) {
    return;
  }
  return (
    <PaymentsList payments={payments} tokenSymbol={symbol} decimals={decimals}/>
  );
};

export default Payments;