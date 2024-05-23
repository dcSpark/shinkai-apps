// libs/shinkai-message-ts/vite.config.ts
import { nxViteTsPaths } from "file:///Users/agallardol/Documents/github/shinkai-visor/node_modules/@nx/vite/plugins/nx-tsconfig-paths.plugin.js";
import { defineConfig } from "file:///Users/agallardol/Documents/github/shinkai-visor/node_modules/vite/dist/node/index.js";
import dts from "file:///Users/agallardol/Documents/github/shinkai-visor/node_modules/vite-plugin-dts/dist/index.mjs";
import topLevelAwait from "file:///Users/agallardol/Documents/github/shinkai-visor/node_modules/vite-plugin-top-level-await/exports/import.mjs";
import wasm from "file:///Users/agallardol/Documents/github/shinkai-visor/node_modules/vite-plugin-wasm/exports/import.mjs";
var vite_config_default = defineConfig({
  cacheDir: "../../node_modules/.vite/shinkai-message-ts",
  build: {
    lib: {
      entry: {
        index: "./src/index.ts",
        api: "./src/api.ts",
        models: "./src/models.ts",
        utils: "./src/utils.ts",
        wasm: "./src/wasm.ts",
        cryptography: "./src/cryptography.ts"
      },
      formats: ["es"]
    },
    target: "esnext",
    outDir: "dist"
  },
  plugins: [
    nxViteTsPaths(),
    wasm(),
    topLevelAwait(),
    dts({
      tsConfigFilePath: "tsconfig.lib.json",
      rollupTypes: true,
      copyDtsFiles: true,
      clearPureImport: false
    })
  ],
  test: {
    watch: false,
    cache: {
      dir: "../../node_modules/.vitest"
    },
    globals: true,
    environment: "jsdom",
    setupFiles: "./scripts/setupTests.ts"
  },
  root: "./"
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibGlicy9zaGlua2FpLW1lc3NhZ2UtdHMvdml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWdhbGxhcmRvbC9Eb2N1bWVudHMvZ2l0aHViL3NoaW5rYWktdmlzb3IvbGlicy9zaGlua2FpLW1lc3NhZ2UtdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9hZ2FsbGFyZG9sL0RvY3VtZW50cy9naXRodWIvc2hpbmthaS12aXNvci9saWJzL3NoaW5rYWktbWVzc2FnZS10cy92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYWdhbGxhcmRvbC9Eb2N1bWVudHMvZ2l0aHViL3NoaW5rYWktdmlzb3IvbGlicy9zaGlua2FpLW1lc3NhZ2UtdHMvdml0ZS5jb25maWcudHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XG5pbXBvcnQgeyBueFZpdGVUc1BhdGhzIH0gZnJvbSAnQG54L3ZpdGUvcGx1Z2lucy9ueC10c2NvbmZpZy1wYXRocy5wbHVnaW4nO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cyc7XG5pbXBvcnQgdG9wTGV2ZWxBd2FpdCBmcm9tICd2aXRlLXBsdWdpbi10b3AtbGV2ZWwtYXdhaXQnO1xuaW1wb3J0IHdhc20gZnJvbSAndml0ZS1wbHVnaW4td2FzbSc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGNhY2hlRGlyOiAnLi4vLi4vbm9kZV9tb2R1bGVzLy52aXRlL3NoaW5rYWktbWVzc2FnZS10cycsXG4gIGJ1aWxkOiB7XG4gICAgbGliOiB7XG4gICAgICBlbnRyeToge1xuICAgICAgICBpbmRleDogJy4vc3JjL2luZGV4LnRzJyxcbiAgICAgICAgYXBpOiAnLi9zcmMvYXBpLnRzJyxcbiAgICAgICAgbW9kZWxzOiAnLi9zcmMvbW9kZWxzLnRzJyxcbiAgICAgICAgdXRpbHM6ICcuL3NyYy91dGlscy50cycsXG4gICAgICAgIHdhc206ICcuL3NyYy93YXNtLnRzJyxcbiAgICAgICAgY3J5cHRvZ3JhcGh5OiAnLi9zcmMvY3J5cHRvZ3JhcGh5LnRzJyxcbiAgICAgIH0sXG4gICAgICBmb3JtYXRzOiBbJ2VzJ10sXG4gICAgfSxcbiAgICB0YXJnZXQ6ICdlc25leHQnLFxuICAgIG91dERpcjogJ2Rpc3QnLFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgbnhWaXRlVHNQYXRocygpLFxuICAgIHdhc20oKSxcbiAgICB0b3BMZXZlbEF3YWl0KCksXG4gICAgZHRzKHtcbiAgICAgIHRzQ29uZmlnRmlsZVBhdGg6ICd0c2NvbmZpZy5saWIuanNvbicsXG4gICAgICByb2xsdXBUeXBlczogdHJ1ZSxcbiAgICAgIGNvcHlEdHNGaWxlczogdHJ1ZSxcbiAgICAgIGNsZWFyUHVyZUltcG9ydDogZmFsc2UsXG4gICAgfSksXG4gIF0sXG4gIHRlc3Q6IHtcbiAgICB3YXRjaDogZmFsc2UsXG4gICAgY2FjaGU6IHtcbiAgICAgIGRpcjogJy4uLy4uL25vZGVfbW9kdWxlcy8udml0ZXN0JyxcbiAgICB9LFxuICAgIGdsb2JhbHM6IHRydWUsXG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgc2V0dXBGaWxlczogJy4vc2NyaXB0cy9zZXR1cFRlc3RzLnRzJyxcbiAgfSxcbiAgcm9vdDogJy4vJyxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMscUJBQXFCO0FBQzlCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sU0FBUztBQUNoQixPQUFPLG1CQUFtQjtBQUMxQixPQUFPLFVBQVU7QUFFakIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsVUFBVTtBQUFBLEVBQ1YsT0FBTztBQUFBLElBQ0wsS0FBSztBQUFBLE1BQ0gsT0FBTztBQUFBLFFBQ0wsT0FBTztBQUFBLFFBQ1AsS0FBSztBQUFBLFFBQ0wsUUFBUTtBQUFBLFFBQ1IsT0FBTztBQUFBLFFBQ1AsTUFBTTtBQUFBLFFBQ04sY0FBYztBQUFBLE1BQ2hCO0FBQUEsTUFDQSxTQUFTLENBQUMsSUFBSTtBQUFBLElBQ2hCO0FBQUEsSUFDQSxRQUFRO0FBQUEsSUFDUixRQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsY0FBYztBQUFBLElBQ2QsS0FBSztBQUFBLElBQ0wsY0FBYztBQUFBLElBQ2QsSUFBSTtBQUFBLE1BQ0Ysa0JBQWtCO0FBQUEsTUFDbEIsYUFBYTtBQUFBLE1BQ2IsY0FBYztBQUFBLE1BQ2QsaUJBQWlCO0FBQUEsSUFDbkIsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUs7QUFBQSxJQUNQO0FBQUEsSUFDQSxTQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsSUFDYixZQUFZO0FBQUEsRUFDZDtBQUFBLEVBQ0EsTUFBTTtBQUNSLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
