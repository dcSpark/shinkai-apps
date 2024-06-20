import 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: typeof import('../../libs/shinkai-i18n/src/lib/resources').default;
    defaultNS: 'translation';
  }
}
