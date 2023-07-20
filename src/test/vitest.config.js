import { defineConfig } from "vitest/config";
import fs from 'fs';
import * as url from 'url';
import viteConfig from '../frontend/vite.config';
import path from 'path';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// Being in a separate directory seemed to interfere with original
// config's environmental variables loading, so import the .env
// and parse it to spread on define (below) so it'll be available.
const importMetaEnvVars = fs.readFileSync(path
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

export default defineConfig({
  ...viteConfig,
  // Alias the frontend/src folder to @ (remember to add jsonconfig.json). 
  resolve: {
    alias: {
      '@': path.join(__dirname, '..', 'frontend', 'src'),
    }
  },
  define: {
    // (Also an alternative example to using EnvironmentalPlugin): 
    ...importMetaEnvVars,
    'import.meta.env.MODE_IS_TESTING': JSON.stringify(true),
    'import.meta.env.WORKER_PATH': JSON.stringify(workerPath),
    'import.meta.env.WORKER_HELLO_WORLD': JSON.stringify('Hello from the Web Worker unit test!'),
    // There are existing flags but for the sake of development, easier to set manually:
  },
  test: {
    globals:true, 
    setupFiles: ['./setup-teardown-hooks.js'],
    environment: 'jsdom',
    include: [
      'src/unit/frontend/*.test.js',
    ],
  }
});


