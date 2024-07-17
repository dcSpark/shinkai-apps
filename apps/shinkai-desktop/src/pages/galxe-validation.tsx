import { useTranslation } from '@shinkai_network/shinkai-i18n';

import { GalxeSusbcriptions } from './galxe-subscriptions';
import { SubpageLayout } from './layout/simple-layout';

export const GalxeValidation = () => {
  const { t } = useTranslation();

  return (
    <SubpageLayout title={t('galxe.label')}>
      <div className="flex grow flex-col space-y-2">
        <GalxeSusbcriptions />
      </div>
    </SubpageLayout>
  );
};
