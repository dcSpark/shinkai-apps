export interface Config {
  isDev: boolean;
  isProduction: boolean;
  isInternalUse: boolean;
  posthogApiKey: string;
}

const config: Config = {
  isDev: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isInternalUse: import.meta.env.VITE_INTERNAL_USE,
  posthogApiKey: import.meta.env.VITE_POSTHOG_API_KEY,
};

export default config;
