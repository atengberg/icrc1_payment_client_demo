
import { icrc1MDTypes } from "../../utils/enums";
import { fromBaseUnits, toBaseUnits, convertExponetialIntoStringWithAllPlaceholderZeros } from "../../utils/utils";
import { RiExternalLinkFill } from "../../components/Icons";

// Todo encapsulate 'utils' functionality as view model presentation transforms.

const ICRC1CanisterMetadata = ({ metadata }) => {
  const asArr = Object.keys(metadata)
    .reduce((acc, cur) => ([ { vkey: `${cur}`, value: metadata[cur] }, ...acc]), 
  []);
  const {
    decimals = null,
    symbol = null,
  } = metadata;
  return (
    <section aria-labelledby="md-header" className="general-list-section-container">
      <div className="rounded-opaque p-4">
        <header id="md-header" name="md-header" className="themed-container-header">
          ICRC1 Token Canister Metadata
        </header>
        {asArr.map(({ vkey, value }) => <MetadatumListElement decimals={decimals} symbol={symbol} key={vkey} vkey={vkey} value={value} />) }
      </div>
    </section>
  )
}

const MetadatumListElement = ({ decimals, symbol, vkey, value }) => {
  function specific() { 
    switch (`${vkey}`.toLowerCase()) {
      case icrc1MDTypes.canisterid: {
        const link = `https://dashboard.internetcomputer.org/canister/${value}`
        return (
          <>
          <div className="font-address mb-2 w-full break-all">{value}</div>
          <a href={link} target="_blank" rel="noreferrer" className="themed-font-color flex w-full items-center">
            <RiExternalLinkFill className="stylish-label-icon-size" />
            <label className="ml-2 cursor-pointer">Visit the Canister on the IC Dashboard</label>
          </a>
          </>
        );
      }
      case icrc1MDTypes.fee: {
        const normalUnits = convertExponetialIntoStringWithAllPlaceholderZeros(fromBaseUnits(1, decimals));
        return <span className="w-full break-words">{`${normalUnits} ${symbol} (or ${value} base units)`}</span>;
      }
      case icrc1MDTypes.logo:
        return <img key={vkey} className="h-16 w-16" src={value} />;
      case icrc1MDTypes.decimals: {
        const baseUnits = toBaseUnits(1, decimals);
        return <span className="w-full break-words">{`${value} (or 1 ${symbol} is equivalent to ${BigInt(baseUnits).toLocaleString()} base units)`}</span>;
      }
      default:
        return <span className="w-full break-words">{`${value}`}</span>;
    }
  }
  return (
    <div className="general-list-element-content-container">
      <span className="select-none font-bold capitalize italic">{`${vkey}`}</span>
      <div className="general-list-element-content-content">
        {specific()}
      </div>
    </div>
  )
}

export default ICRC1CanisterMetadata;
