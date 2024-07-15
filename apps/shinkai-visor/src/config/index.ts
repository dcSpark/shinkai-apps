export interface Config {
  isDev: boolean;
  isProduction: boolean;
}

const config: Config = {
  isDev: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config;
