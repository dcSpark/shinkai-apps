import legacy from "@vitejs/plugin-legacy";
import wasm from "vite-plugin-wasm";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), legacy(), wasm()],
  test: {
    watch: false,
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
