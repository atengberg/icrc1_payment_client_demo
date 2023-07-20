
const ZeroPaymentsPlaceholder = () => {
  return (
    <div className="m-m:gap-2 themed-font-color flex min-h-[20rem] w-full flex-col items-center sm:gap-4 lg:gap-8">
      <div className="flex-[2]"></div>
      <span className="m-m:text-2xl text-xl font-medium sm:text-4xl">No payments to list...</span>
      <span className="m-m:text-xl text-lg sm:text-3xl">Send a payment to get started!</span>
      <div className="flex-[7]"></div>
    </div>
  )
};

export default ZeroPaymentsPlaceholder;