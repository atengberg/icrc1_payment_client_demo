import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import useInternetIdentity from './hooks/useInternetIdentity.jsx';
import CanisterProvider from './feature/canister-provider/CanisterProvider.jsx';
import App from './App.jsx';
import './index.css';

// Typescript should mean this is unnecessary.
global.BigInt.prototype.toJSON = function () { return this.toString() };

// Indexdb not available in testing context (and hooks can't be called conditionally).
const TestingDapp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const auth = {
    getPrincipal: () => 'jg6qm-uw64t-m6ppo-oluwn-ogr5j-dc5pm-lgy2p-eh6px-hebcd-5v73i-nqe',
    isAuthenticated,
    login: () => setIsAuthenticated(() => true),
    logout: () => setIsAuthenticated(() => false)
  };
  return (
    <Router>
      <CanisterProvider 
        workerFilePath="../worker/worker.js"
        auth={auth} 
      >
        <App />
      </CanisterProvider>
    </Router>
  )
};

const Dapp = () => {
  // Note the CanisterProvider will pass auth spread as part of its value.
  const auth = useInternetIdentity({ 
    onUserLoggedOut: () => window.location.reload() 
  });
  return (
    <Router>
      <CanisterProvider 
        workerFilePath="../worker/worker.js"
        auth={auth} 
      >
        <App />
      </CanisterProvider>
    </Router>
  )
};

const dapp = (
  import.meta.env?.MODE_IS_TESTING ? <TestingDapp /> : <Dapp />
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

