export interface Config {
  isDev: boolean;
  isInternalUse: boolean;
}

const config: Config = {
  isDev: import.meta.env.DEV,
  isInternalUse: import.meta.env.VITE_INTERNAL_USE,
};

export default config;
