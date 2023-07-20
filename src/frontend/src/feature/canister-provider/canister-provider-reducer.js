import { actionTypes } from "../../utils/enums";

const initReducerState = {
  initialized: { 
    canisterMetadata: false, 
    accountStateSync: false,
  },
  canisterMetadata: null,
  accountAddress: null,
  currentBalanceBaseUnits: null,
  createdCount: null,
  payments: null,
};

const reducer = (state, { type, key, payload }) => {
  console.log(`CanisterProvider reducer dispatch called with ${JSON.stringify({ type, payload, key})}`);
  switch (type) {
    case actionTypes.INITIALIZED: {
      const { initialized } = state;
      initialized[key] = payload;
      return {
        ...state,
        initialized
      };
    }
    // Note all canister (query) call responses are formed into result type (see utils), so
    // this is pushing spread lazy but redundant values (timestamps mostly) are not needed here (so far),
    // otherwise additional switch on key can be used to distinguish (or unique action type).
    case actionTypes.VALUE: {
      return {
        ...state,
        ...payload
      };
    }
    // Only used (so far) for the send_payment response. 
    // `fromClient` distinguishes that the UI created the incoming (pending) payment viewmodel. 
    case actionTypes.UPDATE: {
      const { payment } = payload;
      let { payments = [] } = state;
      if (payload?.fromClient) {
        payments.unshift(payment);
      } else {
        payments = payments.map(p => (payment.clientPaymentId === p.clientPaymentId) ? payment : p);
      }
      return {
        ...state,
        payments
      };
    }
    case actionTypes.ERROR: {
      // Todo 
      return {
        ...state,
      };
    }
    case actionTypes.RESET: {
      return initReducerState;
    }
    default:
      throw new Error(`CanisterProvider's reducer was dispatched an event with no action type!`);
  }
};

export default reducer;
export { initReducerState };