import useCanister from "../feature/canister-provider/useCanister";
import ICRC1CanisterMetadata from "../feature/home/ICRC1CanisterMetadata";
import AccountOverview from "../feature/home/AccountOverview";

const Home = () => {
  const { 
    createdCount, 
    accountAddress, 
    currentBalanceBaseUnits, 
    canisterMetadata 
  } = useCanister();

  return (
    <div className="scrollable">
      <AccountOverview  
        createdCount={createdCount} 
        accountAddress={accountAddress} 
        currentBalanceBaseUnits={currentBalanceBaseUnits} 
        metadata={canisterMetadata} 
      />
      <div className="m-l:h-3 h-2 sm:h-4 lg:h-6 xl:h-8"></div>
      <ICRC1CanisterMetadata metadata={canisterMetadata} />
    </div>
  );
};

export default Home;