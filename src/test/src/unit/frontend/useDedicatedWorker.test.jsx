// @vitest-environment jsdom

// Required for the useDedicatedWorker hook to be capable of loading the worker's module script. 
import '@vitest/web-worker';
// Note, easiest way of handling web worker's file path resolution was to define it in config. 
import { describe, expect, it } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRef, useLayoutEffect, useCallback } from 'react';

// Copied here since easier to use hard coded paths for web worker.
const useDedicatedWorker = (onMessageCallback) => {
  const workerRef = useRef(null);
  useLayoutEffect(() => {
    const w = new Worker(new URL('../unit-worker.js', import.meta.url), { type: 'module' });
    w.addEventListener('message', ({ data }) => { if (onMessageCallback) { onMessageCallback(data); } });
    workerRef.current = w;
    return () => { workerRef.current?.terminate(); workerRef.current = null; };
  }, [onMessageCallback]);
  const postMessage = useCallback((data = {}) => workerRef.current?.postMessage(data), []);
  return { postMessage };
};

describe('Test useDedicatedWorker Hook', () => {
  it('should initialize the web worker with post message correctly handling default callback case', async () => {
    let val;
    const quoteUnquoteMockDispatch = data => val = data.result;
    const { result } = renderHook(() => useDedicatedWorker(quoteUnquoteMockDispatch));
    expect(result.current.postMessage).toBeDefined();
    act(() => result.current.postMessage({}));
    await waitFor(() => expect(val).toBe(import.meta.env.WORKER_HELLO_WORLD));
  });

  it(`should initialize the web worker with post message correctly handling the 'unique-string123z' case`, async () => {
    let val;
    const { result } = renderHook(() => useDedicatedWorker(data => val = data.result ));
    act(() => result.current.postMessage({ type: "unique-string123z", zeta: 3 }));
    await waitFor(() => { expect(val).toBe(4); });
  });
});