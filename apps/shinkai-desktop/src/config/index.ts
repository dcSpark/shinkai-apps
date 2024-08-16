export interface Config {
  isDev: boolean;
  isProduction: boolean;
  posthogApiKey: string;
}

const config: Config = {
  isDev: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  posthogApiKey: import.meta.env.VITE_POSTHOG_API_KEY,
};

export default config;
