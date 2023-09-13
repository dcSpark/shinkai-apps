/// <reference types="vitest" />
import { crx,ManifestV3Export } from "@crxjs/vite-plugin";
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from 'vite-plugin-wasm';

import manifestJson from './public/manifest.json';

const manifest = manifestJson as ManifestV3Export;

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

  plugins: [react(), nxViteTsPaths(), wasm(), topLevelAwait(), crx({ manifest })],

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
});
