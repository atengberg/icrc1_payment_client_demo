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
    // Puts the value of the env var key MODE_IS_TESTING from .env onto import.meta.env,
    // (Has the UI display a bug action bar icon to toggle auth, forces auth'd identity to be predefined test identity):
    EnvironmentPlugin(["MODE_IS_TESTING"], { defineOn: "import.meta.env" }),
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


