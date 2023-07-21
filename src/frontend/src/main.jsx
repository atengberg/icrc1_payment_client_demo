import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import CanisterProvider from './feature/canister-provider/CanisterProvider.jsx';
import App from './App.jsx';
import './index.css';

// Typescript should mean this is unnecessary.
global.BigInt.prototype.toJSON = function () { return this.toString() };

const dapp = (
  <Router>
    <CanisterProvider workerFilePath="../worker/worker.js">
      <App />
    </CanisterProvider>
  </Router>
);

const notSupported = (
  <div className="mt-[21%] w-full text-center text-3xl italic">
    This dapp requires a browser that supports ESM module type web workers (try Brave).
  </div>
);

// Check web workers supported; Firefox doesn't yet by default allow module type workers.
// See https://github.com/vitejs/vite/issues/12874 for more info.
const supported = !(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)

ReactDOM.createRoot(document.getElementById('root')).render(
  supported ? dapp : notSupported 
);

