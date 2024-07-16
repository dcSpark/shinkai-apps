import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shinkai_network/shinkai-ui';
import { z } from 'zod';

import { GalxeRegisterShinkaiDesktop } from './galxe-register-shinkai-desktop';
import { GalxeSusbcriptions } from './galxe-subscriptions';
import { SubpageLayout } from './layout/simple-layout';

export const RegisterShinkaiDesktopInstallationFormSchema = z.object({
  address: z.string().min(42),
  signature: z.string().min(8),
  combined: z.string().min(8),
});
export type RegisterShinkaiDesktopInstallationForm = z.infer<
  typeof RegisterShinkaiDesktopInstallationFormSchema
>;

export const GalxeValidation = () => {
  const { t } = useTranslation();

  return (
    <SubpageLayout title={t('galxe.label')}>
      <div className="flex grow flex-col space-y-2">
        <Tabs
          className="flex h-full w-full flex-col"
          defaultValue="galxe-installation"
        >
          <TabsList>
            <TabsTrigger
              className="flex flex-1 items-center gap-2"
              value="galxe-installation"
            >
              Installation Quest
            </TabsTrigger>
            <TabsTrigger
              className="flex flex-1 items-center gap-2"
              value="galxe-subscriptions"
            >
              Subscriptions Quest
            </TabsTrigger>
          </TabsList>
          <TabsContent className="h-full" value="galxe-installation">
            <GalxeRegisterShinkaiDesktop />
          </TabsContent>
          <TabsContent className="h-full" value="galxe-subscriptions">
            <GalxeSusbcriptions />
          </TabsContent>
        </Tabs>
      </div>
    </SubpageLayout>
  );
};
