import  { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import EnvironmentPlugin from 'vite-plugin-environment'

export default defineConfig({
  envDir: "../../",
  plugins: [
    react(),
    // Spreads all the envars from .env prefixed with "CANISTER_" onto import.meta.env:
    EnvironmentPlugin("all", { prefix: "CANISTER_", defineOn: "import.meta.env" }),
    // Spreads all the envars from .env prefixed with "DFX_" onto import.meta.env: 
    EnvironmentPlugin("all", { prefix: "DFX_", defineOn: "import.meta.env" }),
    // Shows a "Debug Bug" next to brand in nav bar that logs in/out with test identity (including webworker actor):
    EnvironmentPlugin({ 'MODE_IS_TESTING': true}, { defineOn: "import.meta.env" }),
  ],
  build: {
    outDir: "dist/",
    emptyOutDir: true,
  },
  worker: {
    format: 'es'
  },
  optimizeDeps: {
    esbuildOptions: {
        // Node.js global to browser globalThis.
        // (Noted that it makes it possible for WebWorker to use imports.) 
        define: {
            global: 'globalThis'
        },
    }
  },
  server: {
    // Local IC replica proxy.  
    proxy: {
      '/api': {
        // Default port used. 
        target: 'http://127.0.0.1:4943',
        changeOrigin: true
      }
    }
  }
})


