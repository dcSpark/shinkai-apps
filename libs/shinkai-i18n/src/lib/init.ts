import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

import { Locales, normalizeLocale } from './constants';

const isDev = import.meta.env.DEV;

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(async (lng: string, ns: string) => {
      if (isDev && lng === 'en-US') return import(`./default`);
      return import(`../../locales/${normalizeLocale(lng)}.json`);
    }),
  )
  .init({
    debug: isDev,
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

/*  Only use this function when you need to render a string from outside a
component. */
export const { t } = i18n;

export type LocaleMode = Locales | 'auto';
export const switchLanguage = (locale: LocaleMode) => {
  const lang = locale === 'auto' ? navigator.language : locale;
  i18n.changeLanguage(lang);
};

export * from './useTranslation';
