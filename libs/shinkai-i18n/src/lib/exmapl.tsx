import { useTranslation } from 'react-i18next';

export const App = () => {
  const { t } = useTranslation();
  return (
    <h1>
      asdadasdas
      {t('qqqq')}
    </h1>
  );
};
