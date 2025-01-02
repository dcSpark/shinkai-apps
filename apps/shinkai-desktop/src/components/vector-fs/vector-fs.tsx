import { useTranslation } from '@shinkai_network/shinkai-i18n';

import { SimpleLayout } from '../../pages/layout/simple-layout';
import AllFilesTab from './components/all-files-tab';
import VectorFSDrawer from './components/vector-fs-drawer';

export default function VectorFs() {
  const { t } = useTranslation();

  return (
    <SimpleLayout title={t('vectorFs.label')}>
      <AllFilesTab />
      <VectorFSDrawer />
    </SimpleLayout>
  );
}
