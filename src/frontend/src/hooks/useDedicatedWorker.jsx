import { useRef, useLayoutEffect, useCallback } from 'react';

/** Creates a webworker from the given `workerModulePath` path routing the callbacks to the UI 
 * through the given `onMessageCallback` resulting from events passed to the hooks' returned 
 * `postMessage` handler (which are passed directly to the webworker). */
const useDedicatedWorker = (workerModulePath, onMessageCallback) => {
  const workerRef = useRef(null);
  // Since we want the workerRef populated before the rest (and is already preloaded), useLayoutEffect is used. 
  useLayoutEffect(() => {
    //const w = new Worker(new URL(workerModulePath, import.meta.url), { type: 'module' });

    const w = new Worker(new URL('../worker/worker.js', import.meta.url), { type: 'module' });
    w.addEventListener('message', ({ data }) => {
      if (onMessageCallback) {
        onMessageCallback(data);
      }
      // console.info(`worker ui onMessage ${JSON.stringify(data)}`);
    });
    workerRef.current = w;
    return () => {  
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [
    workerModulePath, 
    onMessageCallback
  ]);
  const postMessage = useCallback((data = {}) => workerRef.current?.postMessage(data), []);
  return {
    postMessage
  };
};

export default useDedicatedWorker;
