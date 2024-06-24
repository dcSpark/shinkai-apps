import { zodResolver } from '@hookform/resolvers/zod';
import {
  LocaleMode,
  localeOptions,
  useTranslation,
} from '@shinkai_network/shinkai-i18n';
import { isShinkaiIdentityLocalhost } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useUpdateNodeName } from '@shinkai_network/shinkai-node-state/lib/mutations/updateNodeName/useUpdateNodeName';
import { useGetHealth } from '@shinkai_network/shinkai-node-state/lib/queries/getHealth/useGetHealth';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/lib/queries/getLLMProviders/useGetLLMProviders';
import {
  Button,
  buttonVariants,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { ExportIcon, QrIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { getVersion } from '@tauri-apps/api/app';
import { motion } from 'framer-motion';
import { BarChart2, CodesandboxIcon, ExternalLinkIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import galxeIcon from '../assets/galxe-icon.png';
import { useShinkaiNodeRespawnMutation } from '../lib/shinkai-node-manager/shinkai-node-manager-client';
import {
  isHostingShinkaiNode,
  openShinkaiNodeManagerWindow,
} from '../lib/shinkai-node-manager/shinkai-node-manager-windows-utils';
import { GENERATE_CODE_PATH } from '../routes/name';
import { SetupData, useAuth } from '../store/auth';
import { useSettings } from '../store/settings';
import { useShinkaiNodeManager } from '../store/shinkai-node-manager';
import { SimpleLayout } from './layout/simple-layout';

const formSchema = z.object({
  defaultAgentId: z.string(),
  displayActionButton: z.boolean(),
  nodeAddress: z.string(),
  shinkaiIdentity: z.string(),
  nodeVersion: z.string(),
  optInAnalytics: z.boolean(),
  optInExperimental: z.boolean(),
  language: z.string(),
});

type FormSchemaType = z.infer<typeof formSchema>;

const MotionButton = motion(Button);

const SettingsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const auth = useAuth((authStore) => authStore.auth);
  const isLocalShinkaiNodeInUse = useShinkaiNodeManager(
    (state) => state.isInUse,
  );
  const userLanguage = useSettings((state) => state.userLanguage);
  const setUserLanguage = useSettings((state) => state.setUserLanguage);
  const optInAnalytics = useSettings((state) => state.optInAnalytics);
  const optInExperimental = useSettings((state) => state.optInExperimental);
  const setOptInExperimental = useSettings(
    (state) => state.setOptInExperimental,
  );

  const setAuth = useAuth((authStore) => authStore.setAuth);

  const defaultAgentId = useSettings(
    (settingsStore) => settingsStore.defaultAgentId,
  );
  const setDefaultAgentId = useSettings(
    (settingsStore) => settingsStore.setDefaultAgentId,
  );
  const { nodeInfo, isSuccess: isNodeInfoSuccess } = useGetHealth({
    node_address: auth?.node_address ?? '',
  });

  const [appVersion, setAppVersion] = useState('');

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defaultAgentId: defaultAgentId,
      nodeAddress: auth?.node_address,
      shinkaiIdentity: auth?.shinkai_identity,
      optInAnalytics,
      optInExperimental,
      language: userLanguage,
    },
  });

  const currentDefaultAgentId = useWatch({
    control: form.control,
    name: 'defaultAgentId',
  });

  const currentOptInExperimental = useWatch({
    control: form.control,
    name: 'optInExperimental',
  });
  const currentLanguage = useWatch({
    control: form.control,
    name: 'language',
  });

  useEffect(() => {
    (async () => {
      setAppVersion(await getVersion());
    })();
  }, []);

  useEffect(() => {
    setUserLanguage(currentLanguage as LocaleMode);
  }, [currentLanguage, setUserLanguage]);

  useEffect(() => {
    setOptInExperimental(currentOptInExperimental);
  }, [currentOptInExperimental, setOptInExperimental]);

  const { llmProviders } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: `${auth?.profile}`,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const { mutateAsync: respawnShinkaiNode } = useShinkaiNodeRespawnMutation();
  const { mutateAsync: updateNodeName, isPending: isUpdateNodeNamePending } =
    useUpdateNodeName({
      onSuccess: () => {
        toast.success(t('settings.shinkaiIdentity.success'));
        if (!auth) return;
        const newAuth: SetupData = { ...auth };
        setAuth({
          ...newAuth,
          shinkai_identity: currentShinkaiIdentity,
        });
        if (isLocalShinkaiNodeInUse) {
          respawnShinkaiNode();
        } else if (!isHostingShinkaiNode(auth.node_address)) {
          toast.info(t('shinkaiNode.restartNode'));
        }
      },
      onError: (error) => {
        toast.error(t('settings.shinkaiIdentity.error'), {
          description: error?.response?.data?.error ?? error.message,
        });
      },
    });

  useEffect(() => {
    if (isNodeInfoSuccess) {
      form.reset({
        ...form.getValues(),
        nodeVersion: nodeInfo?.version ?? '',
        shinkaiIdentity: nodeInfo?.node_name ?? '',
      });
    }
  }, [form, isNodeInfoSuccess, nodeInfo?.node_name, nodeInfo?.version]);

  const currentShinkaiIdentity = useWatch({
    control: form.control,
    name: 'shinkaiIdentity',
  });
  const handleUpdateNodeName = async () => {
    if (!auth) return;
    await updateNodeName({
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      profile: auth?.profile,
      newNodeName: form.getValues().shinkaiIdentity,
      my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
      my_device_identity_sk: auth?.profile_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    });
  };

  useEffect(() => {
    setDefaultAgentId(currentDefaultAgentId);
  }, [currentDefaultAgentId, setDefaultAgentId]);

  const isIdentityLocalhost = isShinkaiIdentityLocalhost(
    auth?.shinkai_identity ?? '',
  );
  return (
    <SimpleLayout classname="max-w-lg" title={t('settings.label')}>
      <p className="mb-3">{t('settings.description')}</p>

      <div className="flex flex-col space-y-8 pr-2.5">
        <div className="flex flex-col space-y-8">
          <Form {...form}>
            <form className="flex grow flex-col justify-between space-y-6 overflow-hidden">
              <FormItem>
                <Select
                  defaultValue={defaultAgentId}
                  name="defaultAgentId"
                  onValueChange={(value) => {
                    form.setValue('defaultAgentId', value);
                  }}
                  value={
                    llmProviders?.find((agent) => agent.id === defaultAgentId)
                      ?.id
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <FormLabel>{t('settings.defaultAgent')}</FormLabel>
                  <SelectContent>
                    {llmProviders?.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>

              <FormField
                control={form.control}
                disabled
                name="nodeAddress"
                render={({ field }) => (
                  <TextField
                    field={field}
                    label={t('shinkaiNode.nodeAddress')}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="shinkaiIdentity"
                render={({ field }) => (
                  <TextField
                    field={{
                      ...field,
                      onKeyDown: (event) => {
                        if (currentShinkaiIdentity === auth?.shinkai_identity)
                          return;
                        if (event.key === 'Enter') {
                          handleUpdateNodeName();
                        }
                      },
                    }}
                    helperMessage={
                      <span className="text-gray-80 inline-flex items-center gap-1 px-1 py-2.5 hover:text-white">
                        {isIdentityLocalhost ? (
                          <a
                            className={cn(
                              buttonVariants({
                                size: 'auto',
                                variant: 'link',
                              }),
                              'rounded-lg p-0 text-xs text-inherit underline',
                            )}
                            href={`https://shinkai-contracts.pages.dev?encryption_pk=${auth?.node_encryption_pk}&signature_pk=${auth?.node_signature_pk}&node_address=${auth?.node_address}`}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {t('settings.shinkaiIdentity.registerIdentity')}
                          </a>
                        ) : (
                          <a
                            className={cn(
                              buttonVariants({
                                size: 'auto',
                                variant: 'link',
                              }),
                              'rounded-lg p-0 text-xs text-inherit underline',
                            )}
                            href={`https://shinkai-contracts.pages.dev/identity/${auth?.shinkai_identity?.replace(
                              '@@',
                              '',
                            )}`}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {t('settings.shinkaiIdentity.goToShinkaiIdentity')}
                          </a>
                        )}
                        <ExternalLinkIcon className="h-4 w-4" />
                      </span>
                    }
                    label={t('settings.shinkaiIdentity.label')}
                  />
                )}
              />
              {currentShinkaiIdentity !== auth?.shinkai_identity && (
                <div className="flex items-center gap-3">
                  <MotionButton
                    className="h-10 min-w-[100px] rounded-lg text-sm"
                    isLoading={isUpdateNodeNamePending}
                    layout
                    onClick={handleUpdateNodeName}
                    size="auto"
                    type="button"
                  >
                    {t('common.save')}
                  </MotionButton>
                  <Button
                    className="h-10 min-w-10 rounded-lg text-sm"
                    onClick={() => {
                      form.setValue(
                        'shinkaiIdentity',
                        auth?.shinkai_identity ?? '',
                      );
                    }}
                    type="button"
                    variant="outline"
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              )}
              <FormField
                control={form.control}
                disabled
                name="nodeVersion"
                render={({ field }) => (
                  <TextField
                    field={field}
                    label={t('shinkaiNode.nodeVersion')}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="optInExperimental"
                render={({ field }) => (
                  <FormItem className="flex gap-2.5">
                    <FormControl>
                      <Switch
                        aria-readonly
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="static space-y-1.5 text-sm text-white">
                        {t('settings.experimentalFeature.label')}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.language.label')}</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('settings.language.selectLanguage')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[
                          {
                            label: 'Automatic',
                            value: 'auto',
                          },
                          ...localeOptions,
                        ].map((locale) => (
                          <SelectItem key={locale.value} value={locale.value}>
                            {locale.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <div className="align-center grid grid-cols-2 justify-center gap-4">
          {isLocalShinkaiNodeInUse && (
            <Button
              className="flex flex-1 cursor-pointer flex-col items-start gap-2 rounded-lg p-4 pr-8 text-left"
              onClick={() => openShinkaiNodeManagerWindow()}
              size="auto"
              variant="ghost"
            >
              <div className="text-gray-100">
                <CodesandboxIcon />
              </div>
              <p className="text-smm text-white">{t('shinkaiNode.manager')}</p>
            </Button>
          )}

          <Button
            className="flex flex-1 cursor-pointer flex-col items-start gap-2 rounded-lg p-4 pr-8 text-left"
            onClick={() => navigate('/export-connection')}
            size="auto"
            variant="ghost"
          >
            <ExportIcon />
            <p className="text-smm text-white">{t('exportConnection.label')}</p>
          </Button>
          <Button
            className="flex flex-1 cursor-pointer flex-col items-start gap-2 rounded-lg p-4 pr-8 text-left"
            onClick={() => navigate(GENERATE_CODE_PATH)}
            size="auto"
            variant="ghost"
          >
            <div className="">
              <QrIcon />
            </div>
            <p className="text-smm text-white">
              {t('registrationCode.create')}
            </p>
          </Button>
          <Button
            className="flex flex-1 cursor-pointer flex-col items-start gap-2 rounded-lg p-4 pr-8 text-left"
            onClick={() => navigate('/analytics-settings')}
            size="auto"
            variant="ghost"
          >
            <BarChart2 className="text-gray-80" />
            <p className="text-smm text-white">{t('analytics.label')}</p>
          </Button>
          <Button
            className="flex flex-1 cursor-pointer flex-col items-start gap-2 rounded-lg p-4 pr-8 text-left"
            onClick={() => navigate('/public-keys')}
            size="auto"
            variant="ghost"
          >
            <div className="text-gray-100">
              <svg
                className="h-6 w-6"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="0"
                viewBox="0 0 512 512"
              >
                <path d="M261.1 24.8c-6.3 0-12.7.43-19.2 1.18-34.6 4.01-64.8 17.59-86.1 37.06-21.4 19.48-34.2 45.56-31 73.16 2.8 24.6 17.8 45.2 39.1 59.4 2.6-6.2 5.9-11.9 9.2-16.5-17.6-11.6-28.4-27.3-30.4-45-2.3-19.7 6.7-39.58 24.8-56.14 18.2-16.57 45.3-29.06 76.6-32.68 31.3-3.63 60.6 2.33 82.1 14.3 21.4 11.98 34.7 29.31 37 48.92 2.2 19.3-6.2 38.8-23.4 55a69.91 69.91 0 0 0-35.4-10.6h-2.2c-5.1.1-10.1.7-15.3 1.8-37.5 8.7-60.8 45.5-52.2 82.7 5.3 23 21.6 40.6 42.2 48.5l39.7 172.2 47 29.1 29.5-46.7-23.5-14.5 14.8-23.4-23.5-14.6 14.7-23.3-23.5-14.6 14.8-23.4-13.5-58.4c15.1-16.1 22-39.1 16.7-62.2-2.7-11.7-8.2-22-15.8-30.4 18.9-19 29.8-43.5 26.8-69.2-3.2-27.55-21.6-50.04-46.9-64.11-20.5-11.45-45.8-17.77-73.1-17.59zm-20.2 135.5c-25.9 1.1-49.9 16.8-60.4 42.2-9.1 21.9-6 45.7 6.2 64.2l-67.8 163 21.3 51 51.2-20.9-10.7-25.5 25.6-10.4-10.6-25.5 25.6-10.4-10.7-25.5 25.6-10.5 22.8-54.8c-20.5-11.5-36.2-31.2-41.9-55.8-6.9-30.3 3.1-60.6 23.8-81.1zm58 7.2c8.9-.1 17.3 3.5 23.4 9.4-5.5 3.5-11.6 6.6-18 9.4-1.6-.6-3.3-.8-5.1-.8-.6 0-1.1 0-1.6.1-7 .8-12.2 6.1-13.1 12.7-.2 1-.2 2-.2 2.9.1.3.1.7.1 1 1 8.4 8.3 14.2 16.7 13.2 6.8-.8 12-5.9 13-12.3 6.2-2.8 12-5.9 17.5-9.4.2 1 .4 2 .5 3 2.1 18-11 34.5-29 36.6-17.9 2.1-34.5-11-36.5-29-2.1-18 11-34.5 29-36.6 1.1-.1 2.2-.2 3.3-.2z" />
              </svg>
            </div>
            <p className="text-smm text-white">
              {t('settings.publicKeys.show')}
            </p>
          </Button>

          <Button
            className="flex flex-1 cursor-pointer flex-col items-start gap-2 rounded-lg p-4 pr-8 text-left"
            onClick={() => navigate('/galxe-validation')}
            size="auto"
            variant="ghost"
          >
            <div className="text-gray-100">
              <img alt="galxe icon" className="h-6 w-6" src={galxeIcon} />
            </div>
            <p className="text-smm text-white">{t('galxe.label')}</p>
          </Button>
        </div>
        <div>
          <p className="text-gray-80 text-right text-xs">
            {t('settings.shinkaiVersion')}{' '}
            <span className="font-bold">{appVersion}</span>
          </p>
        </div>
      </div>
    </SimpleLayout>
  );
};

export default SettingsPage;
