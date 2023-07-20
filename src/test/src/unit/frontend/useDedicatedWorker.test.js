
// Required for the useDedicatedWorker hook to be capable of loading the worker's module script. 
import '@vitest/web-worker';
// Note, easiest way of handling web worker's file path resolution was to define it in config. 
import { describe, expect, it } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useDedicatedWorker from '@/hooks/useDedicatedWorker';

describe('Test useDedicatedWorker Hook', () => {
  it('should initialize the web worker with post message correctly handling default callback case', async () => {
    let val;
    const quoteUnquoteMockDispatch = data => val = data.result;
    const { result } = renderHook(() => useDedicatedWorker(import.meta.env.WORKER_PATH, quoteUnquoteMockDispatch));
    expect(result.current.postMessage).toBeDefined();
    act(() => result.current.postMessage({}));
    await waitFor(() => expect(val).toBe(import.meta.env.WORKER_HELLO_WORLD));
  });

  it(`should initialize the web worker with post message correctly handling the 'unique-string123z' case`, async () => {
    let val;
    const { result } = renderHook(() => useDedicatedWorker(import.meta.env.WORKER_PATH, data => val = data.result ));
    act(() => result.current.postMessage({ type: "unique-string123z", zeta: 3 }));
    await waitFor(() => { expect(val).toBe(4); });
  });
});