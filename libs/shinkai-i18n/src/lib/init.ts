import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import EnLocales from './locales/en-US.json';
import zhLocales from './locales/zh-CN.json';
import { Locales } from './resources';

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    debug: true,
    resources: {
      en: {
        translation: EnLocales,
      },
      zh: {
        translation: zhLocales,
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

export type LocaleMode = Locales | 'auto';
export const switchLanguage = (locale: LocaleMode) => {
  const lang = locale === 'auto' ? navigator.language : locale;
  i18n.changeLanguage(lang);
};

export * from './useTranslation';
