/// <reference types="vitest" />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/shinkai-visor',

  server: {
    port: 4201,
    host: 'localhost',
    fs: {
      // Important to server files two levels ahead of the project folder
      allow: ['../../'],
    },
  },

  preview: {
    port: 4301,
    host: 'localhost',
  },

  plugins: [react(), nxViteTsPaths(), wasm()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
    },
  },
  root: './',

  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        'service-worker': fileURLToPath(new URL('./src/service-worker.ts', import.meta.url)),
        popup: fileURLToPath(new URL('./src/popup/popup.html', import.meta.url)),
      },
      output: {
        entryFileNames: 'assets/[name].js',
      }
    },
  },
  esbuild: {
    // Important for wasm plugin
    supported: {
      'top-level-await': true,
      'bigint': true,
    }
  }
});
