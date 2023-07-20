import ZeroPaymentsPlaceholder from "./ZeroPaymentsPlaceholder";
import PaymentListItem from "./PaymentListItem";

// Todo: add status icon (instead of just color) if pending or error.
// Todo: display current balance if empty ("Need to add funds? etc")

const PaymentsList = ({ 
  payments,
  tokenSymbol,
  decimals
}) => {
  if (!payments || !decimals || !tokenSymbol) {
    return null;
  } else if (payments.length === 0) {
    return <ZeroPaymentsPlaceholder />;
  } else {
    return (
      <div className="scrollable">
        <ul className="rounded-opaque container-content-width flex flex-col">
          {payments.map((p, i) => (
            <PaymentListItem 
              {...p} 
              key={p.id} 
              tokenSymbol={tokenSymbol}
              decimals={decimals}
            />
          ))}
        </ul>
      </div>
    )
  }
};

export default PaymentsList;