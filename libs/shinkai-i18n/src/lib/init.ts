import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome to React and react-i18next',
    },
  },
  fr: {
    translation: {
      welcome: 'Bienvenue à React et react-i18next',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  nonExplicitSupportedLngs: true,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
