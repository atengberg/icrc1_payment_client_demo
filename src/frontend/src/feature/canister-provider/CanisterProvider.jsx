import { useMemo, createContext, useReducer, useCallback, useEffect } from 'react';
import useDedicatedWorker from '../../hooks/useDedicatedWorker';
import Spinner from '../../components/Spinner';
import reducer, { initReducerState } from "./canister-provider-reducer";
import { stateKeys, actionTypes } from '../../utils/enums';

const CanisterContext = createContext({});

/** This context provider (managed by a reducer & composed with useII and useDedicatedWorker) could do more, 
 * although local storage might be more optimal for some things like canister metadata (decimals, etc). 
 * If no fan of reducers, swap out reducer and dispatch with a setState handler for all the state needed (as
 * a callback to useDedicatedWorker will be needed). 
 * Note { type, key, payload / args } type is used for both reducer's dispatch and webworker messages' data. 
 * */
const CanisterProvider = ({ 
  auth,
  workerFilePath,
  children
}) => {
  
  // Init the reducer:
  const [state, dispatch] = useReducer(reducer, initReducerState);  
  
  // Init the webworker handler, passing it the worker's path and reducer's dispatch:
  const { postMessage } = useDedicatedWorker(workerFilePath, dispatch);

  // Cleanup when unmounted:
  useEffect(() => { return () => dispatch({ type: actionTypes.RESET });}, []);
  
  // Called by SendPayment when sending a payment is confirmed: the UI is updated 
  // with the view model of the pending payment until the call to the backend canister 
  // completes via the webworker, which then updates the UI accordingly.
  const onDispatchSendPayment = useCallback((args, payment) => {
    // Update the UI with the pending client created payment viewmodel:
    dispatch({ 
      type: actionTypes.UPDATE, 
      key: stateKeys.payment, 
      payload: { 
        payment, 
        fromClient: true 
      } 
    });
    // Post the send_payment call to the canister:
    postMessage({ 
      type: actionTypes.UPDATE, 
      key: stateKeys.payment, 
      args
    });
  }, [postMessage])

  const {
    isAuthenticated,
    login,
    logout,
    // getPrincipal used to create cache key in worker:
    getPrincipal
  } = auth;

  // Note the clientPaymentId is actually used (since it's the UI). 
  const getPaymentById = useCallback((clientPaymentId) => state?.payments?.find(p => p.clientPaymentId === clientPaymentId), [state]);

  //If more functionality needed, these could be generally used to:
  // 1) Dispatch events to the reducer/UI:
  //const taskUi = useCallback((data) => dispatch(data), []);
  // 2) Dispatch events to the webworker:
  //const taskWorker = useCallback((data) => postMessage(data), [postMessage]);
  // Just make them available in the memoization below:

  // Memoization is React's form of TLC. 
  const memeod = useMemo(() => ({
    ...state, 
    isAuthenticated,
    login,
    logout,
    onDispatchSendPayment,
    getPaymentById,
  }), [
    state,
    isAuthenticated,
    login,
    logout,
    onDispatchSendPayment,
    getPaymentById,
  ]);

  // Passed to the worker for checking the ibd cache:
  const principal = getPrincipal();

  // Initializes canister metadata:
  useEffect(() => {
    if (!state.initialized.canisterMetadata) {
      if (!state.canisterMetadata) {
        const key = stateKeys.canisterMetadata;
        dispatch({ type: actionTypes.INITIALIZED, key, payload: true });
        postMessage({ type: actionTypes.QUERY, key, args: { principal } });
      }
    }
  }, [state, postMessage, principal ]);

  // Initializes account state sync / backend polling:
  useEffect(() => {
    if (isAuthenticated) {
      if (!state.initialized.accountStateSync) {
        if (!state.payments) {
          const key = stateKeys.accountStateSync;
          dispatch({ type: actionTypes.INITIALIZED, key, payload: true });
          postMessage({ type: actionTypes.QUERY, key, args: { principal } });
        }
      }
    }
  }, [isAuthenticated, state, postMessage, principal ]);

  // Show loading spinner while these are still being set, if authenticated:
  if (isAuthenticated) {
    if ((!(state?.canisterMetadata?.decimals)) || (!(state?.payments)) || (!(state?.accountAddress))){
      return <Spinner />;
    }; 
  };

  return (
    <CanisterContext.Provider value={memeod}>
      {children}
    </CanisterContext.Provider>
  );
};

export default CanisterProvider;
// Should not be imported by other than useCanister, hence the as renaming. 
export { CanisterContext as canisterContextBinding };


