import {
  Trans as I18NextTrans,
  useTranslation as useI18NextTranslation,
} from 'react-i18next';

export const useTranslation = () => {
  const { t } = useI18NextTranslation();
  const Trans = I18NextTrans;

  return {
    t,
    Trans,
  };
};
