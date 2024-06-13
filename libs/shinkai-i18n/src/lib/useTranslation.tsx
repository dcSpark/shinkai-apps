import { useCallback } from 'react';
import {
  Trans as I18NextTrans,
  type TransProps as I18NextTransProps,
  useTranslation as useI18NextTranslation,
} from 'react-i18next';

interface TransProps extends Omit<I18NextTransProps<'t'>, 't' | 'i18nKey'> {
  i18nKey: string;
}

export const useTranslation = () => {
  const { t } = useI18NextTranslation();

  const Trans: React.FC<TransProps> = useCallback(
    ({ children, ...otherProps }) => (
      <I18NextTrans t={t} {...otherProps}>
        {children}
      </I18NextTrans>
    ),
    [t],
  );

  return {
    t,
    Trans,
  };
};
