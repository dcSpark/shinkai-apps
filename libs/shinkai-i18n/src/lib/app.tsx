import { useTranslation } from 'react-i18next';

const App = () => {
  const { t } = useTranslation();
  return <h1>{t('agents.add')}</h1>;
};
