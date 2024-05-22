// vite.config.ts
import { crx } from "file:///Users/paulclindo/local/dcspark/shinkai-apps/node_modules/@crxjs/vite-plugin/dist/index.mjs";
import { nxViteTsPaths } from "file:///Users/paulclindo/local/dcspark/shinkai-apps/node_modules/@nx/vite/plugins/nx-tsconfig-paths.plugin.js";
import react from "file:///Users/paulclindo/local/dcspark/shinkai-apps/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { resolve } from "path";
import { defineConfig } from "file:///Users/paulclindo/local/dcspark/shinkai-apps/node_modules/vite/dist/node/index.js";
import topLevelAwait from "file:///Users/paulclindo/local/dcspark/shinkai-apps/node_modules/vite-plugin-top-level-await/exports/import.mjs";
import wasm from "file:///Users/paulclindo/local/dcspark/shinkai-apps/node_modules/vite-plugin-wasm/exports/import.mjs";
import tsconfigPaths from "file:///Users/paulclindo/local/dcspark/shinkai-apps/node_modules/vite-tsconfig-paths/dist/index.mjs";

// dynamic-manifest.ts
import { defineManifest } from "file:///Users/paulclindo/local/dcspark/shinkai-apps/node_modules/@crxjs/vite-plugin/dist/index.mjs";

// public/manifest.json
var manifest_default = {
  name: "Shinkai Visor: Supercharged AI for Tasks",
  description: "Shinkai supercharges AI to better handle your daily tasks and helps the AI to stay up-to-date with global information.",
  manifest_version: 3,
  update_url: "https://clients2.google.com/service/update2/crx",
  version: "0.0.0.1",
  icons: {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  },
  action: {
    default_title: "Click to toggle panel",
    default_icon: {
      "16": "icon16.png",
      "48": "icon48.png"
    }
  },
  minimum_chrome_version: "114",
  background: {
    service_worker: "src/service-worker/service-worker.ts"
  },
  web_accessible_resources: [
    {
      matches: ["https://*/*", "http://*/*", "<all_urls>"],
      resources: ["src/components/popup/popup.html"],
      use_dynamic_url: true
    }
  ],
  permissions: [
    "storage",
    "contextMenus",
    "scripting",
    "activeTab",
    "sidePanel"
  ],
  side_panel: {
    default_path: "src/components/popup/popup.html"
  },
  host_permissions: ["<all_urls>"],
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';"
  },
  content_scripts: [
    {
      matches: ["https://*/*", "http://*/*", "<all_urls>"],
      js: [
        "src/components/image-capture/image-capture.tsx",
        "src/components/action-button/action-button.tsx"
      ],
      run_at: "document_end"
    }
  ],
  externally_connectable: {
    matches: ["https://*/*", "http://*/*", "<all_urls>"]
  }
};

// dynamic-manifest.ts
var getVersion = () => {
  const version = process.env.VERSION || manifest_default.version || "0.0.0.1";
  const [major, minor, patch, label = "0"] = version.replace(/[^\d.-]+/g, "").split(/[.-]/);
  return `${major}.${minor}.${patch}.${label}`;
};
var getName = () => {
  return `${process.env.NAME_PREFIX || ""}${manifest_default.name}`;
};
var getDescription = () => {
  return `${process.env.DESCRIPTION_PREFIX || ""}${manifest_default.description}`;
};
var getPublicKey = () => {
  return process.env.PUBLIC_KEY || "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgdEOqEQpJXJIfmVTNW9NELXqA4yE2WoGo6C7ssQSW9oWiGugLRyUp1EeZ1xQSMaIN08yppKkn49QrTDo73/myuxP94LJ/vZN4rVuEYkzWUfKEv4bSABPkUkhNygddf22iXvfKpQkMzLnmXiKetS6k0NYDoz5GT8oVO2HxmQOgCJpX7wq6W0SzntqmUp5zN2FEh6rcZd20evL1HpxBA4ZylWmiS3n2pMfzCoR37YYaUlwE8Og+6RtuZIR3XaBKo7g3AG4vPi+TO5Jk4hjybYHtA38fBn6Gc5LEahywnJcoLTTSHEQ4hvylHgvlC9RpI8p121cRSmK2ycTuKpVBoRKMwIDAQAB";
};
var dynamicManifest = defineManifest((env) => {
  return {
    ...manifest_default,
    version: getVersion(),
    name: getName(),
    description: getDescription(),
    key: getPublicKey()
  };
});

// vite.config.ts
var __vite_injected_original_dirname = "/Users/paulclindo/local/dcspark/shinkai-apps/apps/shinkai-visor";
var vite_config_default = defineConfig({
  cacheDir: "../../node_modules/.vite/shinkai-visor",
  server: {
    port: 4201,
    host: "localhost",
    fs: {
      // Important to server files two levels ahead of the project folder
      allow: ["../../"]
    },
    hmr: {
      port: 4201
    }
  },
  preview: {
    port: 4301,
    host: "localhost"
  },
  plugins: [
    react(),
    nxViteTsPaths({ debug: true }),
    tsconfigPaths({ projects: ["./"] }),
    wasm({ bundle: true }),
    topLevelAwait(),
    crx({ manifest: dynamicManifest })
  ],
  test: {
    globals: true,
    cache: {
      dir: "../../node_modules/.vitest"
    },
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    coverage: {
      provider: "v8"
    }
  },
  root: "./",
  build: {
    outDir: "../../dist/apps/shinkai-visor",
    rollupOptions: {
      input: {
        popup: resolve(__vite_injected_original_dirname, "src/components/popup/popup.html"),
        setup: resolve(__vite_injected_original_dirname, "src/components/setup/setup.html")
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiZHluYW1pYy1tYW5pZmVzdC50cyIsICJwdWJsaWMvbWFuaWZlc3QuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9wYXVsY2xpbmRvL2xvY2FsL2Rjc3Bhcmsvc2hpbmthaS1hcHBzL2FwcHMvc2hpbmthaS12aXNvclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3BhdWxjbGluZG8vbG9jYWwvZGNzcGFyay9zaGlua2FpLWFwcHMvYXBwcy9zaGlua2FpLXZpc29yL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9wYXVsY2xpbmRvL2xvY2FsL2Rjc3Bhcmsvc2hpbmthaS1hcHBzL2FwcHMvc2hpbmthaS12aXNvci92aXRlLmNvbmZpZy50c1wiOy8vLyA8cmVmZXJlbmNlIHR5cGVzPVwidml0ZXN0XCIgLz5cbmltcG9ydCB7IGNyeCB9IGZyb20gJ0Bjcnhqcy92aXRlLXBsdWdpbic7XG5pbXBvcnQgeyBueFZpdGVUc1BhdGhzIH0gZnJvbSAnQG54L3ZpdGUvcGx1Z2lucy9ueC10c2NvbmZpZy1wYXRocy5wbHVnaW4nO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHRvcExldmVsQXdhaXQgZnJvbSAndml0ZS1wbHVnaW4tdG9wLWxldmVsLWF3YWl0JztcbmltcG9ydCB3YXNtIGZyb20gJ3ZpdGUtcGx1Z2luLXdhc20nO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocyc7XG5cbmltcG9ydCB7IGR5bmFtaWNNYW5pZmVzdCB9IGZyb20gJy4vZHluYW1pYy1tYW5pZmVzdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGNhY2hlRGlyOiAnLi4vLi4vbm9kZV9tb2R1bGVzLy52aXRlL3NoaW5rYWktdmlzb3InLFxuXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDQyMDEsXG4gICAgaG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgZnM6IHtcbiAgICAgIC8vIEltcG9ydGFudCB0byBzZXJ2ZXIgZmlsZXMgdHdvIGxldmVscyBhaGVhZCBvZiB0aGUgcHJvamVjdCBmb2xkZXJcbiAgICAgIGFsbG93OiBbJy4uLy4uLyddLFxuICAgIH0sXG4gICAgaG1yOiB7XG4gICAgICBwb3J0OiA0MjAxLFxuICAgIH0sXG4gIH0sXG4gIHByZXZpZXc6IHtcbiAgICBwb3J0OiA0MzAxLFxuICAgIGhvc3Q6ICdsb2NhbGhvc3QnLFxuICB9LFxuXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIG54Vml0ZVRzUGF0aHMoeyBkZWJ1ZzogdHJ1ZSB9KSxcbiAgICB0c2NvbmZpZ1BhdGhzKHsgcHJvamVjdHM6IFsnLi8nXSB9KSxcbiAgICB3YXNtKHsgYnVuZGxlOiB0cnVlIH0pLFxuICAgIHRvcExldmVsQXdhaXQoKSxcbiAgICBjcngoeyBtYW5pZmVzdDogZHluYW1pY01hbmlmZXN0IH0pLFxuICBdLFxuXG4gIHRlc3Q6IHtcbiAgICBnbG9iYWxzOiB0cnVlLFxuICAgIGNhY2hlOiB7XG4gICAgICBkaXI6ICcuLi8uLi9ub2RlX21vZHVsZXMvLnZpdGVzdCcsXG4gICAgfSxcbiAgICBlbnZpcm9ubWVudDogJ2pzZG9tJyxcbiAgICBpbmNsdWRlOiBbJ3NyYy8qKi8qLnt0ZXN0LHNwZWN9LntqcyxtanMsY2pzLHRzLG10cyxjdHMsanN4LHRzeH0nXSxcbiAgICBjb3ZlcmFnZToge1xuICAgICAgcHJvdmlkZXI6ICd2OCcsXG4gICAgfSxcbiAgfSxcbiAgcm9vdDogJy4vJyxcbiAgYnVpbGQ6IHtcbiAgICBvdXREaXI6ICcuLi8uLi9kaXN0L2FwcHMvc2hpbmthaS12aXNvcicsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgaW5wdXQ6IHtcbiAgICAgICAgcG9wdXA6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NvbXBvbmVudHMvcG9wdXAvcG9wdXAuaHRtbCcpLFxuICAgICAgICBzZXR1cDogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvY29tcG9uZW50cy9zZXR1cC9zZXR1cC5odG1sJyksXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3BhdWxjbGluZG8vbG9jYWwvZGNzcGFyay9zaGlua2FpLWFwcHMvYXBwcy9zaGlua2FpLXZpc29yXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvcGF1bGNsaW5kby9sb2NhbC9kY3NwYXJrL3NoaW5rYWktYXBwcy9hcHBzL3NoaW5rYWktdmlzb3IvZHluYW1pYy1tYW5pZmVzdC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvcGF1bGNsaW5kby9sb2NhbC9kY3NwYXJrL3NoaW5rYWktYXBwcy9hcHBzL3NoaW5rYWktdmlzb3IvZHluYW1pYy1tYW5pZmVzdC50c1wiO2ltcG9ydCB7IGRlZmluZU1hbmlmZXN0IH0gZnJvbSAnQGNyeGpzL3ZpdGUtcGx1Z2luJztcblxuaW1wb3J0IGJhc2VNYW5pZmVzdEpzb24gZnJvbSAnLi9wdWJsaWMvbWFuaWZlc3QuanNvbic7XG5cbmNvbnN0IGdldFZlcnNpb24gPSAoKSA9PiB7XG4gIGNvbnN0IHZlcnNpb24gPSBwcm9jZXNzLmVudi5WRVJTSU9OIHx8IGJhc2VNYW5pZmVzdEpzb24udmVyc2lvbiB8fCAnMC4wLjAuMSc7XG4gIGNvbnN0IFttYWpvciwgbWlub3IsIHBhdGNoLCBsYWJlbCA9ICcwJ10gPSB2ZXJzaW9uXG4gICAgLnJlcGxhY2UoL1teXFxkLi1dKy9nLCAnJylcbiAgICAuc3BsaXQoL1suLV0vKTtcbiAgcmV0dXJuIGAke21ham9yfS4ke21pbm9yfS4ke3BhdGNofS4ke2xhYmVsfWA7XG59O1xuXG5jb25zdCBnZXROYW1lID0gKCkgPT4ge1xuICByZXR1cm4gYCR7cHJvY2Vzcy5lbnYuTkFNRV9QUkVGSVggfHwgJyd9JHtiYXNlTWFuaWZlc3RKc29uLm5hbWV9YDtcbn07XG5cbmNvbnN0IGdldERlc2NyaXB0aW9uID0gKCkgPT4ge1xuICByZXR1cm4gYCR7cHJvY2Vzcy5lbnYuREVTQ1JJUFRJT05fUFJFRklYIHx8ICcnfSR7XG4gICAgYmFzZU1hbmlmZXN0SnNvbi5kZXNjcmlwdGlvblxuICB9YDtcbn07XG5cbmNvbnN0IGdldFB1YmxpY0tleSA9ICgpID0+IHtcbiAgcmV0dXJuIChcbiAgICBwcm9jZXNzLmVudi5QVUJMSUNfS0VZIHx8XG4gICAgJ01JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBZ2RFT3FFUXBKWEpJZm1WVE5XOU5FTFhxQTR5RTJXb0dvNkM3c3NRU1c5b1dpR3VnTFJ5VXAxRWVaMXhRU01hSU4wOHlwcEtrbjQ5UXJURG83My9teXV4UDk0TEovdlpONHJWdUVZa3pXVWZLRXY0YlNBQlBrVWtoTnlnZGRmMjJpWHZmS3BRa016TG5tWGlLZXRTNmswTllEb3o1R1Q4b1ZPMkh4bVFPZ0NKcFg3d3E2VzBTem50cW1VcDV6TjJGRWg2cmNaZDIwZXZMMUhweEJBNFp5bFdtaVMzbjJwTWZ6Q29SMzdZWWFVbHdFOE9nKzZSdHVaSVIzWGFCS283ZzNBRzR2UGkrVE81Sms0aGp5YllIdEEzOGZCbjZHYzVMRWFoeXduSmNvTFRUU0hFUTRodnlsSGd2bEM5UnBJOHAxMjFjUlNtSzJ5Y1R1S3BWQm9SS013SURBUUFCJ1xuICApO1xufTtcblxuZXhwb3J0IGNvbnN0IGR5bmFtaWNNYW5pZmVzdCA9IGRlZmluZU1hbmlmZXN0KChlbnYpID0+IHtcbiAgcmV0dXJuIHtcbiAgICAuLi5iYXNlTWFuaWZlc3RKc29uLFxuICAgIHZlcnNpb246IGdldFZlcnNpb24oKSxcbiAgICBuYW1lOiBnZXROYW1lKCksXG4gICAgZGVzY3JpcHRpb246IGdldERlc2NyaXB0aW9uKCksXG4gICAga2V5OiBnZXRQdWJsaWNLZXkoKSxcbiAgfTtcbn0pO1xuIiwgIntcbiAgXCJuYW1lXCI6IFwiU2hpbmthaSBWaXNvcjogU3VwZXJjaGFyZ2VkIEFJIGZvciBUYXNrc1wiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiU2hpbmthaSBzdXBlcmNoYXJnZXMgQUkgdG8gYmV0dGVyIGhhbmRsZSB5b3VyIGRhaWx5IHRhc2tzIGFuZCBoZWxwcyB0aGUgQUkgdG8gc3RheSB1cC10by1kYXRlIHdpdGggZ2xvYmFsIGluZm9ybWF0aW9uLlwiLFxuICBcIm1hbmlmZXN0X3ZlcnNpb25cIjogMyxcbiAgXCJ1cGRhdGVfdXJsXCI6IFwiaHR0cHM6Ly9jbGllbnRzMi5nb29nbGUuY29tL3NlcnZpY2UvdXBkYXRlMi9jcnhcIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMC4wLjAuMVwiLFxuICBcImljb25zXCI6IHtcbiAgICBcIjE2XCI6IFwiaWNvbjE2LnBuZ1wiLFxuICAgIFwiNDhcIjogXCJpY29uNDgucG5nXCIsXG4gICAgXCIxMjhcIjogXCJpY29uMTI4LnBuZ1wiXG4gIH0sXG4gIFwiYWN0aW9uXCI6IHtcbiAgICBcImRlZmF1bHRfdGl0bGVcIjogXCJDbGljayB0byB0b2dnbGUgcGFuZWxcIixcbiAgICBcImRlZmF1bHRfaWNvblwiOiB7XG4gICAgICBcIjE2XCI6IFwiaWNvbjE2LnBuZ1wiLFxuICAgICAgXCI0OFwiOiBcImljb240OC5wbmdcIlxuICAgIH1cbiAgfSxcbiAgXCJtaW5pbXVtX2Nocm9tZV92ZXJzaW9uXCI6IFwiMTE0XCIsXG4gIFwiYmFja2dyb3VuZFwiOiB7XG4gICAgXCJzZXJ2aWNlX3dvcmtlclwiOiBcInNyYy9zZXJ2aWNlLXdvcmtlci9zZXJ2aWNlLXdvcmtlci50c1wiXG4gIH0sXG4gIFwid2ViX2FjY2Vzc2libGVfcmVzb3VyY2VzXCI6IFtcbiAgICB7XG4gICAgICBcIm1hdGNoZXNcIjogW1wiaHR0cHM6Ly8qLypcIiwgXCJodHRwOi8vKi8qXCIsIFwiPGFsbF91cmxzPlwiXSxcbiAgICAgIFwicmVzb3VyY2VzXCI6IFtcInNyYy9jb21wb25lbnRzL3BvcHVwL3BvcHVwLmh0bWxcIl0sXG4gICAgICBcInVzZV9keW5hbWljX3VybFwiOiB0cnVlXG4gICAgfVxuICBdLFxuICBcInBlcm1pc3Npb25zXCI6IFtcbiAgICBcInN0b3JhZ2VcIixcbiAgICBcImNvbnRleHRNZW51c1wiLFxuICAgIFwic2NyaXB0aW5nXCIsXG4gICAgXCJhY3RpdmVUYWJcIixcbiAgICBcInNpZGVQYW5lbFwiXG4gIF0sXG4gIFwic2lkZV9wYW5lbFwiOiB7XG4gICAgXCJkZWZhdWx0X3BhdGhcIjogXCJzcmMvY29tcG9uZW50cy9wb3B1cC9wb3B1cC5odG1sXCJcbiAgfSxcbiAgXCJob3N0X3Blcm1pc3Npb25zXCI6IFtcIjxhbGxfdXJscz5cIl0sXG4gIFwiY29udGVudF9zZWN1cml0eV9wb2xpY3lcIjoge1xuICAgIFwiZXh0ZW5zaW9uX3BhZ2VzXCI6IFwic2NyaXB0LXNyYyAnc2VsZicgJ3dhc20tdW5zYWZlLWV2YWwnOyBvYmplY3Qtc3JjICdzZWxmJztcIlxuICB9LFxuICBcImNvbnRlbnRfc2NyaXB0c1wiOiBbXG4gICAge1xuICAgICAgXCJtYXRjaGVzXCI6IFtcImh0dHBzOi8vKi8qXCIsIFwiaHR0cDovLyovKlwiLCBcIjxhbGxfdXJscz5cIl0sXG4gICAgICBcImpzXCI6IFtcbiAgICAgICAgXCJzcmMvY29tcG9uZW50cy9pbWFnZS1jYXB0dXJlL2ltYWdlLWNhcHR1cmUudHN4XCIsXG4gICAgICAgIFwic3JjL2NvbXBvbmVudHMvYWN0aW9uLWJ1dHRvbi9hY3Rpb24tYnV0dG9uLnRzeFwiXG4gICAgICBdLFxuICAgICAgXCJydW5fYXRcIjogXCJkb2N1bWVudF9lbmRcIlxuICAgIH1cbiAgXSxcbiAgXCJleHRlcm5hbGx5X2Nvbm5lY3RhYmxlXCI6IHtcbiAgICBcIm1hdGNoZXNcIjogW1wiaHR0cHM6Ly8qLypcIiwgXCJodHRwOi8vKi8qXCIsIFwiPGFsbF91cmxzPlwiXVxuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsU0FBUyxXQUFXO0FBQ3BCLFNBQVMscUJBQXFCO0FBQzlCLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFDeEIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxtQkFBbUI7QUFDMUIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sbUJBQW1COzs7QUNSK1YsU0FBUyxzQkFBc0I7OztBQ0F4WjtBQUFBLEVBQ0UsTUFBUTtBQUFBLEVBQ1IsYUFBZTtBQUFBLEVBQ2Ysa0JBQW9CO0FBQUEsRUFDcEIsWUFBYztBQUFBLEVBQ2QsU0FBVztBQUFBLEVBQ1gsT0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLFFBQVU7QUFBQSxJQUNSLGVBQWlCO0FBQUEsSUFDakIsY0FBZ0I7QUFBQSxNQUNkLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsRUFDRjtBQUFBLEVBQ0Esd0JBQTBCO0FBQUEsRUFDMUIsWUFBYztBQUFBLElBQ1osZ0JBQWtCO0FBQUEsRUFDcEI7QUFBQSxFQUNBLDBCQUE0QjtBQUFBLElBQzFCO0FBQUEsTUFDRSxTQUFXLENBQUMsZUFBZSxjQUFjLFlBQVk7QUFBQSxNQUNyRCxXQUFhLENBQUMsaUNBQWlDO0FBQUEsTUFDL0MsaUJBQW1CO0FBQUEsSUFDckI7QUFBQSxFQUNGO0FBQUEsRUFDQSxhQUFlO0FBQUEsSUFDYjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQUEsRUFDQSxZQUFjO0FBQUEsSUFDWixjQUFnQjtBQUFBLEVBQ2xCO0FBQUEsRUFDQSxrQkFBb0Is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
