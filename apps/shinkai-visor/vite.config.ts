/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { fileURLToPath } from 'url';

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

  plugins: [react(), nxViteTsPaths()],

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
        background: fileURLToPath(new URL('./src/background.ts', import.meta.url)),
        content: fileURLToPath(new URL('./src/content.ts', import.meta.url)),
        popup: fileURLToPath(new URL('./src/popup/popup.html', import.meta.url)),
      },
      output: {
        entryFileNames: 'assets/[name].js',
      }
    },
  },
});
