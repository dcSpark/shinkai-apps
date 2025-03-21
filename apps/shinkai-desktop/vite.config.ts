import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [
    react(),
    nxViteTsPaths(),
    wasm(),
    legacy({
      targets: ['>0.3%', 'not dead', 'safari>=14'],
      polyfills: ['es.array.at', 'es.object.has-own'],
      modernPolyfills: ['es.array.at', 'es.object.has-own'],
    }),
  ],
  esbuild: {
    // Important for wasm plugin
    supported: {
      'top-level-await': true,
      bigint: true,
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // Exclude output.wav from being watched
      ignored: ['**/output.wav'],
    },
    // headers: {
    //   'Cross-Origin-Embedder-Policy': 'require-corp',
    //   'Cross-Origin-Opener-Policy': 'cross-origin',
    // },
  },
  // 3. to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  // to access the Tauri environment variables set by the CLI with information about the current target
  envPrefix: [
    'VITE_',
    'TAURI_PLATFORM',
    'TAURI_ARCH',
    'TAURI_FAMILY',
    'TAURI_PLATFORM_VERSION',
    'TAURI_PLATFORM_TYPE',
    'TAURI_DEBUG',
  ],

  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        shinkai_node_manager: resolve(
          __dirname,
          'src/windows/shinkai-node-manager/index.html',
        ),
        spotlight: resolve(__dirname, 'src/windows/spotlight/index.html'),
        coordinator: resolve(__dirname, 'src/windows/coordinator/index.html'),
        shinkai_artifacts: resolve(
          __dirname,
          'src/windows/shinkai-artifacts/index.html',
        ),
      },
    },
  },
  worker: {
    format: 'es' as const,
  },
}));
