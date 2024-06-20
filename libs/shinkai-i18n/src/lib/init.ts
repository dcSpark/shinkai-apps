import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

import { Locales, normalizeLocale } from './constants';

const isDev = import.meta.env.DEV;

const initI18n = () => {
  i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(
      resourcesToBackend(async (lng: string) => {
        if (isDev && lng === 'en-US') return import(`./default`);
        return import(`../../locales/${normalizeLocale(lng)}.json`);
      }),
    )
    .init({
      debug: isDev,
      fallbackLng: 'en-US',
      interpolation: {
        escapeValue: false,
      },
    });
  return i18n;
};

export const i18NextInstance = initI18n();

/*  Only use this function when you need to render a string from outside a
component. */
export const { t } = i18NextInstance;

export * from './useTranslation';

export type LocaleMode = Locales | 'auto';

export const switchLanguage = (locale: LocaleMode) => {
  const lang = locale === 'auto' ? navigator.language : locale;
  i18NextInstance.changeLanguage(lang);
};
