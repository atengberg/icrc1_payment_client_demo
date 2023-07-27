import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { AuthClient } from '@dfinity/auth-client';

// Note the original AuthClient II demo includes principal, identity and actor 
// as part of its state. That may be more useful if using newer React Router 
// data router with loader and actions (as callbacks, such as with the web worker
// are not supported with loader and actions--however there is some work with
// setting up that with the comlink library which is async/await for webworkers as
// it is to promises).

const useInternetIdentity = (onUserLoggedOutCallback) => {

  const authClientRef = useRef(null);
  const [principal, setPrincipal] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const updateAuth = useCallback(async (client) => {
    if (!client) throw new Error("Cannot update auth state without an auth client!");
    const authenticated = await client.isAuthenticated();
    authClientRef.current = client;
    setPrincipal(() => client.getIdentity().getPrincipal().toString());
    setIsAuthenticated(() => authenticated);
  }, []);

  const createSetAuthClient = useCallback(async () => {
    // Use onIdle callback to redirect route, etc.
    await AuthClient.create().then(updateAuth);
  }, [updateAuth]);

  useEffect(() => {
    // Initialize an authClient.
    createSetAuthClient();
  }, [createSetAuthClient]);

  const login = useCallback(() => {
    authClientRef.current?.login({
      identityProvider:
        import.meta.env.DFX_NETWORK === 'ic'
          ? 'https://identity.ic0.app/#authorize'
          : `http://127.0.0.1:4943?canisterId=${import.meta.env.CANISTER_ID_INTERNET_IDENTITY}#authorize`,
      onSuccess: async () => {
        await updateAuth(authClientRef.current);
      }
    });
  }, [updateAuth]);

  const logout = useCallback(async () => {
    await authClientRef.current?.logout();
    // (Let the previous authClient be garbage collected so when web worker pulls identity, it'll be fresh.)
    await createSetAuthClient();
    onUserLoggedOutCallback();
  }, [
    createSetAuthClient,
    onUserLoggedOutCallback
  ]);

  return useMemo(() => {
    return {
      login,
      logout,
      isAuthenticated,
      principal,
    };
  }, [login, logout, isAuthenticated, principal]);
};

export default useInternetIdentity;