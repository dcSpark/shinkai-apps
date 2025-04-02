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
import { useGetShinkaiFreeModelQuota } from '@shinkai_network/shinkai-node-state/v2/queries/getShinkaiFreeModelQuota/useGetShinkaiFreeModelQuota';
import {
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  TextField,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { getVersion } from '@tauri-apps/api/app';
import { formatDuration, intervalToDuration } from 'date-fns';
import { motion, progress } from 'framer-motion';
import { ExternalLinkIcon, InfoIcon, MessageSquare, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { OnboardingStep } from '../components/onboarding/constants';
import {
  useShinkaiNodeGetOllamaVersionQuery,
  useShinkaiNodeRespawnMutation,
} from '../lib/shinkai-node-manager/shinkai-node-manager-client';
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
  ollamaVersion: z.string(),
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
  const optInAnalytics = useSettings((state) =>
    state.getStepChoice(OnboardingStep.ANALYTICS),
  );
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
      ollamaVersion: '',
      optInAnalytics: !!optInAnalytics,
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

  const { data: ollamaVersion } = useShinkaiNodeGetOllamaVersionQuery();
  useEffect(() => {
    form.setValue('ollamaVersion', ollamaVersion ?? '');
  }, [ollamaVersion, form]);

  const { data: shinkaiFreeModelQuota } = useGetShinkaiFreeModelQuota(
    { nodeAddress: auth?.node_address ?? '', token: auth?.api_v2_key ?? '' },
    { enabled: !!auth },
  );

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
    <SimpleLayout classname="max-w-xl" title={t('settings.layout.general')}>
      <div className="flex items-center justify-between mb-6">
        <p>{t('settings.description')}</p>
        <Link 
          to="/settings/feedback"
          className={cn(
            buttonVariants({ 
              size: 'xs',
              variant: 'outline',
              rounded: 'lg'
            }),
            'gap-1'
          )}
        >
          <MessageSquare className="h-4 w-4" />
          {t('feedback.button', 'Feedback')}
        </Link>
      </div>
      <div className="flex flex-col space-y-8 pr-2.5">
        <div className="flex flex-col space-y-8">
          {shinkaiFreeModelQuota && (
            <Card className="bg-official-gray-950 w-full">
              <CardHeader className="space-y-1">
                <h3 className="text-base font-semibold">
                  Free Shinkai AI Usage
                </h3>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total tokens used</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-white">
                      {shinkaiFreeModelQuota.usedTokens}{' '}
                      <span className="text-official-gray-500 text-xs">
                        / {shinkaiFreeModelQuota.tokensQuota}
                      </span>
                    </span>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="size-3 text-current" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          A token is a chunk of text — it can be a word, part of
                          a word, or even punctuation. AI processes text in
                          tokens, and usage is measured by how many tokens are
                          used. <br /> <br /> Based on your current usage, you
                          have approximately{' '}
                          {Math.floor(
                            (shinkaiFreeModelQuota.tokensQuota -
                              shinkaiFreeModelQuota.usedTokens) /
                              2,
                          )}{' '}
                          messages remaining.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <Progress
                  className="h-2 rounded-full"
                  max={100}
                  value={
                    shinkaiFreeModelQuota?.tokensQuota
                      ? Math.min(
                          100,
                          (shinkaiFreeModelQuota.usedTokens /
                            shinkaiFreeModelQuota.tokensQuota) *
                            100,
                        )
                      : 0
                  }
                />
              </CardContent>

              <CardFooter>
                <span className="text-official-gray-200 text-xs">
                  Your free limit resets in{' '}
                  {formatDuration(
                    intervalToDuration({
                      start: 0,
                      end: shinkaiFreeModelQuota?.resetTime * 60 * 1000,
                    }),
                  )}
                </span>
              </CardFooter>
            </Card>
          )}

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
              <div className="space-y-1">
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
                        <div className="flex items-center justify-start gap-3">
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
                                {t(
                                  'settings.shinkaiIdentity.goToShinkaiIdentity',
                                )}
                              </a>
                            )}
                            <ExternalLinkIcon className="h-4 w-4" />
                          </span>
                          <a
                            className={cn(
                              buttonVariants({
                                size: 'auto',
                                variant: 'link',
                              }),
                              'text-gray-80 rounded-lg p-0 text-xs underline hover:text-white',
                            )}
                            href="https://docs.shinkai.com/advanced/shinkai-identity-troubleshooting"
                            rel="noreferrer"
                            target="_blank"
                          >
                            {t(
                              'settings.shinkaiIdentity.troubleRegisterIdentity',
                            )}
                          </a>
                        </div>
                      }
                      label={t('settings.shinkaiIdentity.label')}
                    />
                  )}
                />
                {currentShinkaiIdentity !== auth?.shinkai_identity && (
                  <div className="space-y-1.5">
                    <p className="text-gray-80/80 flex items-center gap-1 text-xs">
                      <InfoIcon className="size-3" />
                      {t('settings.shinkaiIdentity.saveWillRestartApp')}
                    </p>
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
              </div>
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
                disabled
                name="ollamaVersion"
                render={({ field }) => (
                  <TextField field={field} label={t('ollama.version')} />
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
