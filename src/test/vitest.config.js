import { defineConfig } from "vitest/config";
import fs from 'fs';
import * as url from 'url';
import viteConfig from '../frontend/vite.config';
import path from 'path';

import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// Being in a separate directory seemed to interfere with original
// config's environmental variables loading, so import the .env
// and parse it to spread on define (below) so it'll be available.
const importAsMetaEnvVars = fs.readFileSync(path
  .join(__dirname, '..', '..', '.env'), { encoding: 'utf8' })
  .split('\n').reduce((acc, cur) => {
  if (cur.includes('=')) {
    const kv = cur.replaceAll(`'`, '').split('=');
    return {
      ...acc,
      [`import.meta.env.${kv[0]}`]: JSON.stringify(kv[1]),
      [`process.env.${kv[0]}`]: JSON.stringify(kv[1])
    };
  } else {
    return acc;
  }
}, {});

const workerPath = path.join(__dirname, 'src', 'unit', 'unit-worker.js');
const originalWorkerPath = path.join(__dirname, '..', 'frontend', 'src', 'worker', 'worker.js');

export default defineConfig({
  ...viteConfig,
  // Alias the frontend/src folder to @ (remember to add jsonconfig.json). 
  resolve: {
    alias: {
      '@': path.join(__dirname, '..', 'frontend', 'src'),
      util: 'rollup-plugin-node-polyfills/polyfills/util',
            sys: 'util',
            events: 'rollup-plugin-node-polyfills/polyfills/events',
            stream: 'rollup-plugin-node-polyfills/polyfills/stream',
            path: 'rollup-plugin-node-polyfills/polyfills/path',
            querystring: 'rollup-plugin-node-polyfills/polyfills/qs',
            punycode: 'rollup-plugin-node-polyfills/polyfills/punycode',
            url: 'rollup-plugin-node-polyfills/polyfills/url',
            string_decoder:
                'rollup-plugin-node-polyfills/polyfills/string-decoder',
            http: 'rollup-plugin-node-polyfills/polyfills/http',
            https: 'rollup-plugin-node-polyfills/polyfills/http',
            os: 'rollup-plugin-node-polyfills/polyfills/os',
            assert: 'rollup-plugin-node-polyfills/polyfills/assert',
            constants: 'rollup-plugin-node-polyfills/polyfills/constants',
            _stream_duplex:
                'rollup-plugin-node-polyfills/polyfills/readable-stream/duplex',
            _stream_passthrough:
                'rollup-plugin-node-polyfills/polyfills/readable-stream/passthrough',
            _stream_readable:
                'rollup-plugin-node-polyfills/polyfills/readable-stream/readable',
            _stream_writable:
                'rollup-plugin-node-polyfills/polyfills/readable-stream/writable',
            _stream_transform:
                'rollup-plugin-node-polyfills/polyfills/readable-stream/transform',
            timers: 'rollup-plugin-node-polyfills/polyfills/timers',
            console: 'rollup-plugin-node-polyfills/polyfills/console',
            vm: 'rollup-plugin-node-polyfills/polyfills/vm',
            zlib: 'rollup-plugin-node-polyfills/polyfills/zlib',
            tty: 'rollup-plugin-node-polyfills/polyfills/tty',
            domain: 'rollup-plugin-node-polyfills/polyfills/domain'
    }
  },
  optimizeDeps: {
    esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
            global: 'globalThis'
        },
        // Enable esbuild polyfill plugins
        plugins: [
            NodeGlobalsPolyfillPlugin({
                process: true,
                buffer: true
            }),
            NodeModulesPolyfillPlugin()
        ]
    }
},
  build: {
    rollupOptions: {
        plugins: [
            // Enable rollup polyfills plugin
            // used during production bundling
            rollupNodePolyFill()
        ]
    }
},
  define: {
    // (Also an alternative example to using EnvironmentalPlugin): 
    ...importAsMetaEnvVars,
    'import.meta.env.MODE_IS_TESTING': JSON.stringify(true),
    'import.meta.env.WORKER_PATH': JSON.stringify(workerPath),
    'import.meta.env.WORKER_HELLO_WORLD': JSON.stringify('Hello from the Web Worker unit test!'),
    'import.meta.env.OG_WORKER_PATH': JSON.stringify(originalWorkerPath)
  },
  test: {
    globals:true, 
    setupFiles: ['./setup-teardown-hooks.js'],
    environment: 'jsdom',
    testTimeout: 15000,
    include: [
      'src/e2e/*.test.jsx',
      //'src/unit/frontend/*.test.js',
    ],
  }
});


