// @ts-expect-error path
import path from 'path';
/// <reference types="vitest" />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import dts from 'vite-plugin-dts';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/shinkai-message-ts',
  build: {
    lib: {
      entry: {
        index: './src/index.ts',
        api: './src/api.ts',
        models: './src/models.ts',
        utils: './src/utils.ts',
        wasm: './src/wasm.ts',
        cryptography: './src/cryptography.ts',
      },
      formats: ['es'],
    },
    target: 'esnext',
    outDir: 'dist',
  },
  plugins: [
    nxViteTsPaths(),
    wasm(),
    topLevelAwait(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
      rollupTypes: true,
      copyDtsFiles: true,
      clearPureImport: false,
    }),
  ],
  test: {
    watch: false,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    globals: true,
    environment: 'jsdom',
    setupFiles: './scripts/setupTests.ts',
  },
  root: __dirname,
});
