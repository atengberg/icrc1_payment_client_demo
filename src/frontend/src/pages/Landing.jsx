const copy = {
  title: 'ICRC1 Payment Demo',
  description: 'A 100% on-chain mobile oriented payment client dapp built on the Internet Computer Protocol with React, Tailwind and Motoko to demonstrate how customers at a point of sale could easily make payments using the ICRC1 token standard.',
  shortDescription: 'Fully on-chain decentralized interoperability bringing the power of BTC to a store near you.',
}

const Landing = () => {
  return (
    <section className="scrollable min-h-[40rem]" aria-labelledby="label-landing-page">
      <label className="sr-only" name="label-landing-page" id="label-landing-page">ICRC1 Payment Client Demo landing page</label>
      <div className="flex h-full w-full flex-col gap-2">
        <div className="flex-[2]"></div>
        <div className="m-xl:flex-row flex flex-col justify-center gap-4 text-center">
          <span className="landing-title text-shadow-inset-xs">ICRC1</span>
          <span className="landing-title text-shadow-inset-xs">Payment</span>
          <span className="landing-title text-shadow-inset-xs">Client</span>
          <span className="landing-title text-shadow-inset-xs">Demo</span>
        </div>
        <div className="hidden text-center sm:mt-8 sm:block sm:px-[10%]">
          <span className="landing-description  text-shadow-inset-xs">{copy.description}</span>
        </div>
        <div className="flex-[2]"></div>
        <div className="flex flex-col items-center justify-center sm:flex-row">
          <a target="_blank" rel="noreferrer" 
              className="mb-4 flex w-[30%] flex-col items-center justify-center sm:mb-0" 
              href="https://internetcomputer.org/docs/current/developer-docs/integrations/bitcoin/ckbtc" 
              title="Visit the ckBTC developer docs at the Dfinity homepage (opens in a new window)"
              aria-label="Visit the ckBTC developer docs at the Dfinity homepage (opens in a new window)."
              >
              <img src={new URL('../../assets/ckbtc.svg', import.meta.url).href} className="m-s:w-[12rem] m-s:h-[12rem] m-xl:w-[14rem] m-xl:h-[14rem] h-24 w-24 md:h-[18rem] md:w-[18rem]" />
          </a>
          <span className="landing-short-description">{copy.shortDescription}</span>
        </div>
        <div className="flex-[7] sm:flex-[5]"></div>
      </div> 
    </section>
  )
};

export default Landing;
