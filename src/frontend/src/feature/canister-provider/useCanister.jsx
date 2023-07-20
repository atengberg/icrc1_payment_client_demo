import { useContext } from 'react';
import { canisterContextBinding } from './CanisterProvider/';

/** What to import to use CanisterProvider's memoized value(s). */
const useCanister = () => useContext(canisterContextBinding);

export default useCanister;
