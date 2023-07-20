# Frontend of ICRC1 Payment Client Demo

This is the frontend client / web app of the ICRC1 Payment Client Demo.  

It is built with Vite, React, Tailwind, React Router, Formik, eslint, and others ([Icônes](https://icones.js.org/) for icons; [react-zxing](https://github.com/adamalfredsson/react-zxing) for scanning qr codes). 

This frontend web app uses an ESM module type web worker to process all communication with the backend canister. 

This is done within a context provider [CanisterProvider.jsx](./src/feature/canister-provider/CanisterProvider.jsx) with state managed by a [reducer](./src/feature/canister-provider/canister-provider-reducer.js) which is additionally composed with the hooks [useInternetIdentity.jsx](./src/hooks/useInternetIdentity.jsx) (which handles II authentication) and [useDedicatedWorker.jsx](./src/hooks//useDedicatedWorker.jsx) (which handles the/a web worker). The provider's spread state value is memoized and importable/obtainable via the `useCanister` hook.

The `CanisterProvider` is declared as the first descendent of the router's provider, which is at the outermost rung immediately before [main.jsx](./src/main.jsx) and [App.jsx](./src/App.jsx). In `main.jsx` a test is done to determine if the user's browser supports ESM modules (Firefox for isntance still does not); if passing, in `App.jsx` the routes are laid out to the top-level page components:

###Pages

- [Landing.jsx](./src/pages/Landing.jsx) (not-authenticated arguably lackluster landing page)
- [Home.jsx](./src/pages/Home.jsx) (authenticated landing page, shows the [AccountOverview.jsx](./src/feature/home/AccountOverview.jsx) and [ICRC1CanisterMetadata.jsx](./src/feature/home/ICRC1CanisterMetadata.jsx) components which show the stats and metadata associated with the caller's ICRC1 subaccount (only the single "default" one is provided, the funds of which payments debits are withdrawn from and can be credited by depositing into its QR code displayed address) and the associated ICRC1 token canister (including its canister id, and svg encoded logo if available))
- [Payments.jsx](./src/pages/Payments.jsx) (shows the very mobile responsive list of payments featuring the custom built [AutoEllipsizingTextSpan.jsx](./src/components/AutoEllipsizingTextSpan.jsx) which ellipsizes in a leading and trailing pair of 5 and 3 characters or a pair 5 and 9-14 characters (if a short subaccount) or two pairs of 5 characters (if a long subaccount); although `AutoEllipsizingTextSpan.jsx` will ellipsize any text to its full width according to the function provided, in this the default case [ellipsize-ICRC1-characters.js](./src/utils/ellipsize-ICRC1-address.js) of which those values can be customized further)
- [PaymentDetails.jsx](./src/pages/PaymentDetails.jsx) (dynamic route path `useParams` encoded `getPaymentById` from `useCanister` gets the payment (if the user clicked on it in `Payments` page) and shows all the details of that payment including its current status which will include the transaction index and time if successful, or time and transfer err or inter-canister caught err if failed unless it was to an invalid recipient address, which is handled by this client but that's not the canister's only potential caller; or the payment will be pending. Note the payment can be copied into a new send payment by clicking the copy icon in the nav bar.)
- [SendPayment.jsx](./src/pages/SendPayment.jsx) (the page with the form for sending a payment that uses Formik for managing inputs, erros and validation and displaying after the input fields a review of the inputs; and that uses a [QrCodeScanner.jsx](./src/feature/qr-code-scanner/QrCodeScanner.jsx) together with the payment decoding utils of [ic-js](https://github.com/dfinity/ic-js) to set the input fields if valid.)

###Note on WebWorker <> UI

Note that as all the canister communication is handled by the background processing ("non-blocking") of the web worker, when the inputs are valid for a payment to be sent, and it is submitted by the form on that page, the UI immediately creates a pending payment viewmodel, using the `clientPaymentId` UI created UUID as its key, when the args are created from the inputs by [prepareSendPaymentArgs](./src/utils/utils.js#L155) which is passed the `CanisterProvider`'s `reducer` at the same time the args are sent as an event to the web worker to be routed to the backend canister's `send_payment` method. Usually this happens too fast to notice, but until the canister call completes, when the route is navigated back to the payment's listing, the payment will appear at the top in yellow indicating its pending. Once the call completes, the `clientPaymentId` will be used to replace the payment's view model, and it will either appear as the normal font color (black or white depending on dark mode) if completed successfully (or red if failed). 

###Utils

Most of any logic that can be encapsulated as its own standalone pure function is all in the [utils.js](./src/utils/utils.js) which includes the view model/presentation transforms as well as the data model transforms parsing the responses of the canister calls. This project uses [bigdecimal](https://github.com/iriscouch/bigdecimal.js/blob/master/README.md) to convert base units to normal units (which is the standard in the UI, although both are often presented for sake of clarity). 

Along with utils, there are also a set of object literal enums in [enums.js](src/utils/enums.js) which include the types used to handle communication with the web worker and the reducer of `CanisterProvider`. This is typically in the form `{ type, key, payload/args }` ("`actionType`", "`stateKey`" ) (`payload` if incoming, `args` if outgoing), and also the payment status types. 

But before venturing into testing, some finals points about the UI and the webworker: 

###Additional UI Notes

- [tailwind.config.js](./tailwind.config.js) includes Dfinity color branding, extends the typical screens as the typical (cellular) mobile viewport width is almost twice that of the smallest default screen and adds text shadows as a custom, but simple plugin. A fluid type plugin was added but later removed as it was easier to manage UI layout for the narrower screens with a fixed font size. 
- [Header.jsx](./src/components//Header.jsx) is the navigation of this app copying the typical 'action bar' behavior although only icons; eventually using absolute positioning for convenience although to handle this for snappy scrolling in the content section, the `.scrollable` css class has a transprent bottom border a little taller than the height of the navbar so the bottom's always easily visible (in addition to the [.pb-safe](./src/index.css#L138) mobile device bottom offset environmental browser var on `body`). Setting the `document`'s title is also handled in header (although an accessible announcer should be added and these could be their own hook).
- [useTheme.jsx](./src/hooks/useTheme.jsx) is a hook wrapper around the Tailwind standard of toggling a class based dark mode
- [useRoutePathReloader.jsx](./src/hooks/useRoutePathReloader.jsx) was added to handle the side effect of the current route resetting to the base route when the browser triggered a refresh. This may not be needed if an alternate `Routes` setup is used (see [App.jsx](./src/App.jsx)), but works fine including resetting route state (such as copying a payment details to send a new payment or while on a specific page's details.)

###Web Worker (and some UI)
- Most of the functionality is in the methods of `utils` prefixed with 'parse'.
- When `MODE_IS_TESTING` is set to true in the [vite.config.js](./vite.config.js), `useInternetIdentity` will return an additional object `dev` which will contain a pair of methods to toggle `useInternetIdentity`'s `isAuthenticated`. This is added into the UI by an additional `Header` action button that looks like a bug, next the brand/logo, which will toggle automatically logging and in out as a predefined test identity in the webworker. 
- This test identity is the ED25519 key pair provided by the `dfx nns extension` code base. If the project is started with the testing flag (`npm run test in root directory`) this identity will receive 100 CVCMICRC1 to use. 
- The web worker calls the token canister metadata anonymously but is authenticated for everything else. It concatenates the caller's principal with the parsed response result to use as the cache key, which is done in indexdb. 
- Note the `send_payment` call response is intentionally delayed by 10s when testing. 

####That should cover it.

Testing's exported into its [own parent directory](../test/), which is where all this project's testing resides. Also handled with Vitest, as far as the frontend primarily `utils.js` and `useDedicatedWorker.js` is covered as far as unit tests. `CanisterProvider` using `useDedicatedWorker.js` are integrated along with the backend canister to cover E2E testing. 

###Final Remarks

Having a clear "UI sitemap" ('user flow stoyboard') is key to really making the best of Tailwind and css. With such, a specific standard set of declaration can be used for the UI, making it far easier to both modify if needed but also focus on specifically what's to be done. Also--Formik will save you time if you are not using it already. Finally, if the backend payment processor is known to support specific ICRC1 tokens, those metadata values could be statically set otherwise caching in `localStorage` on the UI might be a better way to handle those values. 

###Follow-up Links

 - [WebDev - Web Payments](https://web.dev/payments/)
 - [WebDev - PWA Case Study Payments/Qr Code Decoding](https://web.dev/mishipay/) 
 - [Tips for your Tailwind Config](https://www.viget.com/articles/tips-for-your-tailwind-config/)
 - [vite build](https://patak.dev/vite/build.html)
 - [HYPERCOLOR](https://hypercolor.dev/)
 - [Box Shadows for TailwindCSS](https://manuarora.in/boxshadows)
 - [TAILBLOCKS.io](https://tailblocks.cc/)
