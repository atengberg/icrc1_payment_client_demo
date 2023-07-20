// Used by the useDedicatedWorker.test.js to mock a more complicated web worker for the unit test of that hook. 

self.addEventListener('message', ({ data }) => {
  const { type, zeta } = data;
  switch (type) {
    case 'unique-string123z':
      self.postMessage({ result: (parseInt(zeta) + 1 )})
      return;
    default:
      self.postMessage({ result: import.meta.env.WORKER_HELLO_WORLD });
      return;
  };
});

