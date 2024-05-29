/// <reference types="vitest" />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  server: {
    port: 4200,
    host: true,
    fs: {
      // Important to server files two levels ahead of the project folder
      allow: ['../../'],
    },
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [react(), nxViteTsPaths(), legacy(), wasm()],
  build: {
    outDir: '../../dist/apps/shinkai-app',
  },
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

  publicDir: 'public',
  esbuild: {
    // Important for wasm plugin
    supported: {
      'top-level-await': true,
      bigint: true,
    },
  },
});
