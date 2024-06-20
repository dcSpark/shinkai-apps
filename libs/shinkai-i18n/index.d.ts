import resources from './src/lib/resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: typeof resources;
    defaultNS: 'translation';
  }
}

export {};
