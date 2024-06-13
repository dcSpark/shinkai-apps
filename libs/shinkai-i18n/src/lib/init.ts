import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import EnLocales from './locales/en.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: EnLocales,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

/*  Only use this function when you need to render a string from outside a
component. */
export const { t } = i18n;
export * from './useTranslation';
