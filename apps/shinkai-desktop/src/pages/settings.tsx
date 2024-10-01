import { zodResolver } from '@hookform/resolvers/zod';
import {
  LocaleMode,
  localeOptions,
  useTranslation,
} from '@shinkai_network/shinkai-i18n';
import { isShinkaiIdentityLocalhost } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useUpdateNodeName } from '@shinkai_network/shinkai-node-state/lib/mutations/updateNodeName/useUpdateNodeName';
import { useGetHealth } from '@shinkai_network/shinkai-node-state/v2/queries/getHealth/useGetHealth';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
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
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { getVersion } from '@tauri-apps/api/app';
import { motion } from 'framer-motion';
import { ExternalLinkIcon, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useShinkaiNodeRespawnMutation } from '../lib/shinkai-node-manager/shinkai-node-manager-client';
import { isHostingShinkaiNode } from '../lib/shinkai-node-manager/shinkai-node-manager-windows-utils';
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
    nodeAddress: auth?.node_address ?? '',
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
    token: auth?.api_v2_key ?? '',
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
    <SimpleLayout classname="max-w-lg" title={t('settings.layout.general')}>
      <p className="mb-3">{t('settings.description')}</p>
      <div className="flex flex-col space-y-8 pr-2.5">
        <div className="flex flex-col space-y-8">
          <Form {...form}>
            <form className="flex grow flex-col justify-between space-y-6 overflow-hidden">
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
              <FormItem>
                <Select
                  defaultValue={defaultAgentId}
                  name="defaultAgentId"
                  onValueChange={(value) => {
                    form.setValue('defaultAgentId', value);
                    useSettings.persist.rehydrate();
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

              {!isIdentityLocalhost && (
                <a
                  className={cn(
                    buttonVariants({
                      size: 'auto',
                      variant: 'ghost',
                    }),
                    'flex cursor-pointer items-start justify-start gap-2 rounded-lg text-xs',
                  )}
                  href={`https://shinkai-contracts.pages.dev/identity/${auth?.shinkai_identity?.replace(
                    '@@',
                    '',
                  )}?encryption_pk=${auth?.node_encryption_pk}&signature_pk=${auth?.node_signature_pk}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ShieldCheck className="h-5 w-5" />
                  <span className="flex flex-col gap-0.5">
                    <span className="capitalize">
                      {t('settings.shinkaiIdentity.checkIdentityInSync')}
                    </span>
                    <span className="text-gray-80">
                      {t(
                        'settings.shinkaiIdentity.checkIdentityInSyncDescription',
                      )}
                    </span>
                  </span>
                </a>
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
            </form>
          </Form>
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
