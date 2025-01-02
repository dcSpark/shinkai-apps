import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { TooltipProvider } from '@shinkai_network/shinkai-ui';

import { SimpleLayout } from '../../pages/layout/simple-layout';
import AllFilesTab from './components/all-files-tab';
import VectorFSDrawer from './components/vector-fs-drawer';

export default function VectorFs() {
  const { t } = useTranslation();

  return (
    <TooltipProvider delayDuration={0}>
      <SimpleLayout title={t('vectorFs.label')}>
        <AllFilesTab />
        <VectorFSDrawer />
      </SimpleLayout>
    </TooltipProvider>
  );
}
