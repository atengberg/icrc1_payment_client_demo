# Frontend of ICRC1 Payment Client Demo

This is the frontend client / web app of the ICRC1 Payment Client Demo.  

It is built with Vite, React, Tailwind, React Router, Formik, eslint and others ([Icônes](https://icones.js.org/) for icons; [react-zxing](https://github.com/adamalfredsson/react-zxing) for scanning QR codes). 

This frontend web app uses an ES module type web worker to process all communication with the backend canister (note that Firefox does not support ES module type workers yet). 

This is done within a context provider [CanisterProvider.jsx](./src/feature/canister-provider/CanisterProvider.jsx) with its UI state managed by a [reducer](./src/feature/canister-provider/canister-provider-reducer.js) and is additionally composed with the hooks [useInternetIdentity.jsx](./src/hooks/useInternetIdentity.jsx) (which handles II authentication) and [useDedicatedWorker.jsx](./src/hooks//useDedicatedWorker.jsx) (which handles the/a web worker). The provider's returned value is memoized and importable/obtainable via the `useCanister` hook anywhere in the rest of the codebase as the `CanisterProvider` is at the outermost scope, just below the router's provider, which can be inspected in [main.jsx](./src/main.jsx). In `main.jsx` a test is done to determine if the user's browser supports ESM type modules (Firefox for instance still does not); if passing, in [App.jsx](./src/App.jsx) the routes are laid out to the top-level page components which are listed next.
### Pages

- [Landing.jsx](./src/pages/Landing.jsx) - the not-authenticated arguably lackluster landing page.  
- [Home.jsx](./src/pages/Home.jsx) - the authenticated landing page, shows the [AccountOverview.jsx](./src/feature/home/AccountOverview.jsx) and [ICRC1CanisterMetadata.jsx](./src/feature/home/ICRC1CanisterMetadata.jsx) components which show the stats associated with the caller's ICRC1 subaccount (currently only one per caller--the funds of which payments debits are withdrawn from and can be credited by depositing into its QR code displayed address) and the associated ICRC1 token canister metadata (including its canister id, and svg encoded logo if available).  
- [Payments.jsx](./src/pages/Payments.jsx) - the very mobile responsive list of payments featuring the custom built [AutoEllipsizingTextSpan.jsx](./src/components/AutoEllipsizingTextSpan.jsx) which ellipsizes the address into its leading and trailing five characters or if a subaccount is present also includes the checksum and the the first three characters of the subaccount (unless the subaccount is shorter than its ellipsized form, in which case the entire subaccount is included); although `AutoEllipsizingTextSpan.jsx` will ellipsize any text to its full width according to the ellipsize function provided, the default value being `ellipsizeICRC1Address` from [ellipsize-ICRC1-characters.js](./src/utils/ellipsize-ICRC1-address.js).  
- [PaymentDetails.jsx](./src/pages/PaymentDetails.jsx) - shows the details of a payment when a user "clicks" on one in the `Payments` listing, using its id via the page's `useParams` encoded route which is passed to the `getPaymentById` from `useCanister` and shows all the details of that payment including its current status which will include the transaction index and time if successful, or time and transfer err or inter-canister caught err if failed (unless it was to an invalid recipient address, which is handled by this client but that's not the canister's only potential caller); or the payment will be pending. Note the payment can be copied into a new send payment by clicking the copy icon in the nav bar on this page.  
- [SendPayment.jsx](./src/pages/SendPayment.jsx) - contains the form for sending a new payment that uses Formik for managing inputs, errors and validation. It also uses a [QrCodeScanner.jsx](./src/feature/qr-code-scanner/QrCodeScanner.jsx) together with the payment decoding utils of [ic-js](https://github.com/dfinity/ic-js) to set the input fields if a valid payment encoding is scanned. 
  
### Web Worker

Note that as all the canister communication is handled by the background processing ("non-blocking") of the web worker, when the inputs are valid for a payment to be sent, and it is submitted by the form on that page, the UI immediately creates a pending payment viewmodel, using the `clientPaymentId` UI created UUID as its key, when the args for the backend's `send_payment` API method are created from the inputs by [prepareSendPaymentArgs](./src/utils/utils.js#L155). This payment view model is passed to the `CanisterProvider`'s `reducer` at the same time the args are sent as an event's data to the web worker to make the call to the backend canister's `send_payment` method. 

Usually this happens too fast to notice, but until the canister call completes, as the route is immediately navigated back to the payment listing, the newly sent payment will appear at the top in yellow indicating it's pending. Once the call completes and its response is parsed by the web worker, the web worker calls back to the `CanisterProvider`'s `reducer` to update the payment listing, the `reducer` using that `clientPaymentId` as key to replace the correct payment's view model, and it will either appear as the normal font color (black or white depending on dark mode) if completed successfully (or in red if sending the payment failed). 

As the web worker uses a different thread it does have not have the same context as the browser session, however to enable the web worker to use imports the vite config's `optimizeDeps` `esBuild` `define` key polyfills `global` to `globalThis`. The was found the best way to handle this, although there are other solutions. 

This also requires that the actor instance be created in the web worker's context which is done in the [createWorkerActor.js](./src/worker/createWorkerActor.js) utiltiy file, which creates the authenticated actor instance from the identity that is set by the `AuthClient` when the user logs into their internet identity (which happens on the UI thread, but as it uses indexdb can be accessed by the web worker). 

Finally note that the web worker's data message has a type in the same form as that of a typical `useReducer` dispatch action: `{ type, key, payload/args }`--payload if incoming (to the UI) and args if outgoing (to the canister). The possible values for `type` and `key` are defined by the `actionType` and `stateKey` enums found in [enums.js](src/utils/enums.js).

### Utils

Most of any logic that can be encapsulated as its own standalone pure function can be found in the [utils.js](./src/utils/utils.js). This includes the view model/presentation transforms as well as the data model transforms parsing the responses of the canister calls. It was not assumed the ICRC1 token canister metadata values would be available beforehand, so getting their values are the first call that the web worker makes (anonymously) and cached in indexdb. 

If your project does know these values beforehand, it would advantageous to define them in the Vite config so they are always and immediately available so they don't have to be managed by the React state components. Alternatively they could also be cached in local storage (once they reach the UI) if their values are to be dynamic. 

This project uses [bigdecimal](https://github.com/iriscouch/bigdecimal.js/blob/master/README.md) to convert base units to normal units (which is the standard in the UI, although both are often presented for sake of clarity). 


### Additional UI Notes

- [tailwind.config.js](./tailwind.config.js) - includes Dfinity color branding, extends the typical screens as the typical (cellular) mobile viewport width is almost twice that of the smallest default screen and adds text shadows as a custom, but simple plugin. A fluid type plugin was added but later removed as it was easier to manage UI layout for the narrower screens with a fixed font size. 
- [Header.jsx](./src/components//Header.jsx) - is the navigation of this app copying the typical 'action bar' behavior although only using icons, and it is absolute positioned. To handle this for snappy scrolling in a content section, the `.scrollable` css class has a transprent bottom border a little taller than the height of the navbar so the bottom of a content section is always easily visible (in addition to the [.pb-safe](./src/index.css#L138) mobile device bottom offset environmental browser var on `body`). Setting the `document`'s title is also handled in header (although this could be done in its own hook with an accessible announcer). 
- [useTheme.jsx](./src/hooks/useTheme.jsx) - is a hook wrapper around the Tailwind standard of toggling a class based dark mode. 
- [useRoutePathReloader.jsx](./src/hooks/useRoutePathReloader.jsx) - was added to handle the side effect of the current route resetting to the base route when the browser triggered a refresh. This may not be needed if an alternate `Routes` setup is used (see [App.jsx](./src/App.jsx)), but works fine including resetting route state (such as copying a payment details to send a new payment or while on a specific page's details).  

### Note on environmental variables

Vite uses `import.meta.env` to spread environmental variables on for access, unlike `process.env` that is used by Webpack. This project uses the Vite plugin [vite-plugin-environment](https://github.com/ElMassimo/vite-plugin-environment) to automatically expose the vars of the root project's `.env` (that is generated by dfx when building the canisters) on `import.meta.env`. This also means the actor's generated declarations must be modified to use `import.meta.env` instead of `process.env` which had to be done anyways for the sake of the web worker. 

Alternatively, the `define` key of the a vite config can be used for this purpose, with either `import.meta.env` or `process.env` being used. For an example see the [testing config](../test/vitest.config.js).

### Follow-up Links

 - [WebDev - Web Payments](https://web.dev/payments/)
 - [WebDev - PWA Case Study Payments/Qr Code Decoding](https://web.dev/mishipay/) 
 - [Tips for your Tailwind Config](https://www.viget.com/articles/tips-for-your-tailwind-config/)
 - [vite build](https://patak.dev/vite/build.html)
 - [HYPERCOLOR](https://hypercolor.dev/)
 - [Box Shadows for TailwindCSS](https://manuarora.in/boxshadows)
 - [TAILBLOCKS.io](https://tailblocks.cc/)
 - [WHATWG - WebWorkers](https://html.spec.whatwg.org/multipage/workers.html)