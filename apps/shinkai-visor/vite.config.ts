/// <reference types="vitest" />
import { crx } from '@crxjs/vite-plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';
import tsconfigPaths from 'vite-tsconfig-paths';

import { dynamicManifest } from './dynamic-manifest';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/shinkai-visor',

  server: {
    port: 4201,
    host: 'localhost',
    fs: {
      // Important to server files two levels ahead of the project folder
      allow: ['../../'],
    },
    hmr: {
      port: 4201,
    },
  },
  preview: {
    port: 4301,
    host: 'localhost',
  },

  plugins: [
    react(),
    nxViteTsPaths({ debug: true }),
    tsconfigPaths({ projects: ['./'] }),
    wasm({ bundle: true }),
    topLevelAwait(),
    crx({ manifest: dynamicManifest }),
  ],

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
    outDir: '../../dist/apps/shinkai-visor',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/components/popup/popup.html'),
        setup: resolve(__dirname, 'src/components/setup/setup.html'),
      },
    },
  },
});
