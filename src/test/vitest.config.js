import { defineConfig } from "vitest/config";
import fs from 'fs';
import * as url from 'url';
import viteConfig from '../frontend/vite.config';
import path from 'path';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// Being in a separate directory seemed to interfere with original
// config's environmental variables loading, so import the .env
// and parse it to spread on define (below) so it'll be available.
// This is another way of making DFX_NETWORK, and other env vars
// available. Note, could also be defined on process.env, OR 
// dotenv could be used in the setup-teardown-hooks. 
const importAsMetaEnvVars = fs.readFileSync(path
  .join(__dirname, '..', '..', '.env'), { encoding: 'utf8' })
  .split('\n').reduce((acc, cur) => {
  if (cur.includes('=')) {
    const kv = cur.replaceAll(`'`, '').split('=');
    return {
      ...acc,
      [`import.meta.env.${kv[0]}`]: JSON.stringify(kv[1]),
    };
  } else {
    return acc;
  }
}, {});

const workerPath = path.join(__dirname, 'src', 'unit', 'unit-worker.js');
const originalWorkerPath = path.join(__dirname, '..', 'frontend', 'src', 'worker', 'worker.js');

export default defineConfig({
  // When using this project structure, this vite config doesn't seem to pickup other's EnvironmentalPlugin env vars set. 
  ...viteConfig,
  // Alias the frontend/src folder to @ (remember to add jsonconfig.json). 
  resolve: {
    alias: {
      '@': path.join(__dirname, '..', 'frontend', 'src')
    }
  },
  define: {
    // (Also serves as alternative example to using EnvironmentalPlugin): 
    ...importAsMetaEnvVars,
    'import.meta.env.WORKER_PATH': JSON.stringify(workerPath),
    'import.meta.env.WORKER_HELLO_WORLD': JSON.stringify('Hello from the Web Worker unit test!'),
    'import.meta.env.OG_WORKER_PATH': JSON.stringify(originalWorkerPath),
    'import.meta.env.MODE_IS_TESTING': JSON.stringify(true),
    'import.meta.env.HOST': JSON.stringify('127.0.0.1:4943'),
    // INDEXEDDB Won't work in tests:
    'import.meta.env.DISABLE_INDEXEDB': JSON.stringify(true),
  },
  test: {
    threads: false,
    setupFiles: ['./setup-teardown-hooks.js'],
    environment: 'jsdom',
    testTimeout: 15000,
    include: [
      'src/e2e/*.test.js',
      'src/unit/frontend/*.test.js',
    ],
  }
});


