import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { AuthClient } from '@dfinity/auth-client';

// Note the original AuthClient II demo includes principal, identity and actor 
// as part of its state. That may be more useful if using newer React Router 
// data router with loader and actions (as callbacks, such as with the web worker
// are not supported with loader and actions--however there is some work with
// setting up that with the comlink library which is async/await for webworkers as
// it is to promises).

const useInternetIdentity = ({
  onUserLoggedOut,
} = {}) => {

  const authClientRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const updateAuth = useCallback(async (client) => {
    if (!client) throw new Error("Cannot update auth state without an auth client!");
    const authenticated = await client.isAuthenticated();
    authClientRef.current = client;
    setIsAuthenticated(() => authenticated);
  }, []);

  const createSetAuthClient = useCallback(() => {
    // Use onIdle callback to redirect route, etc.
    AuthClient.create().then(updateAuth);
  }, [updateAuth]);

  useEffect(() => {
    // Initialize an authClient.
    createSetAuthClient();
  }, [createSetAuthClient]);

  const login = useCallback(() => {
    authClientRef.current?.login({
      identityProvider:
        import.meta.env.DFX_NETWORK === 'ic'
          ? 'https://identity.ic0.io/#authorize'
          : `http://localhost:4943?canisterId=${import.meta.env.CANISTER_ID_INTERNET_IDENTITY}#authorize`,
      onSuccess: async () => {
        await updateAuth(authClientRef.current);
      }
    });
  }, [updateAuth]);

  const logout = useCallback(async () => {
    await authClientRef.current?.logout();
    // (Let the previous authClient be garbage collected so when web worker pulls identity, it'll be fresh.)
    createSetAuthClient();
    onUserLoggedOut();
  }, [
    createSetAuthClient, 
    onUserLoggedOut
  ]);

  const dev = useMemo(() => {
    // Get from environmental variable.
    const isTesting = (import.meta.env.MODE_IS_TESTING || false);
    const login = () => setIsAuthenticated(() => true);
    const logout = () => setIsAuthenticated(() => false);
    return {
      isTesting, 
      login: isTesting ? login : () => {},
      logout: isTesting ? logout : () => {},
    };
  }, []);

  return useMemo(() => {
    return {
      dev,
      login,
      logout,
      isAuthenticated
    };
  }, [login, logout, dev, isAuthenticated]);
};

export default useInternetIdentity;