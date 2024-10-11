import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  QuickConnectFormSchema,
  quickConnectFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/auth/quick-connection';
import { useSubmitRegistrationNoCode } from '@shinkai_network/shinkai-node-state/v2/mutations/submitRegistation/useSubmitRegistrationNoCode';
import { useGetEncryptionKeys } from '@shinkai_network/shinkai-node-state/v2/queries/getEncryptionKeys/useGetEncryptionKeys';
import { Button, Progress } from '@shinkai_network/shinkai-ui';
import {
  downloadModelImg,
  downloadModelVideo,
} from '@shinkai_network/shinkai-ui/assets';
import { submitRegistrationNoCodeError } from '@shinkai_network/shinkai-ui/helpers';
import { useReverseVideoPlayback } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { ResetStorageBeforeConnectConfirmationPrompt } from '../components/reset-storage-before-connect-confirmation-prompt';
import config from '../config';
import { useShinkaiNodeSpawnMutation } from '../lib/shinkai-node-manager/shinkai-node-manager-client';
import { ShinkaiNodeManagerEvent } from '../lib/shinkai-node-manager/shinkai-node-manager-client-types';
import { useShinkaiNodeEventsToast } from '../lib/shinkai-node-manager/shinkai-node-manager-hooks';
import { useAuth } from '../store/auth';

export const modelNameMap: Record<string, string> = {
  'snowflake-arctic-embed:xs': "Snowflake's Arctic-embed-xs",
  'llama3.1:8b-instruct-q4_1': 'Llama 3.1 8B',
  'gemma2:2b-instruct-q4_1': 'Gemma 2 2B',
};
const GetStartedPage = () => {
  const navigate = useNavigate();
  const { t, Trans } = useTranslation();
  const setAuth = useAuth((state) => state.setAuth);
  const [
    resetStorageBeforeConnectConfirmationPromptOpen,
    setResetStorageBeforeConnectConfirmationPrompt,
  ] = useState(false);
  const shinkaiNodeEventState = useShinkaiNodeEventsToast();
  const videoRef = useReverseVideoPlayback();

  const { encryptionKeys } = useGetEncryptionKeys();
  const setupDataForm = useForm<QuickConnectFormSchema>({
    resolver: zodResolver(quickConnectFormSchema),
    defaultValues: {
      registration_name: 'main_device',
      node_address: 'http://127.0.0.1:9550',
    },
  });

  const { mutateAsync: submitRegistrationNoCode } = useSubmitRegistrationNoCode(
    {
      onSuccess: (response, setupPayload) => {
        if (response.status !== 'success') {
          shinkaiNodeKill();
        }
        if (response.status === 'success' && encryptionKeys) {
          const updatedSetupData = {
            ...encryptionKeys,
            ...setupPayload,
            permission_type: '',
            shinkai_identity:
              setupDataForm.getValues().shinkai_identity ||
              (response.data?.node_name ?? ''),
            node_signature_pk: response.data?.identity_public_key ?? '',
            node_encryption_pk: response.data?.encryption_public_key ?? '',
            api_v2_key: response.data?.api_v2_key ?? '',
          };
          setAuth(updatedSetupData);
          // Hide http subscription for now
          // navigate('/connect-ai');
          navigate('/ai-model-installation');
        } else if (response.status === 'non-pristine') {
          setResetStorageBeforeConnectConfirmationPrompt(true);
        } else {
          submitRegistrationNoCodeError();
        }
      },
    },
  );
  const {
    isPending: shinkaiNodeSpawnIsPending,
    mutateAsync: shinkaiNodeSpawn,
  } = useShinkaiNodeSpawnMutation({
    onSuccess: () => {
      onSubmit(setupDataForm.getValues());
    },
  });
  const { mutateAsync: shinkaiNodeKill } = useShinkaiNodeSpawnMutation();

  async function onSubmit(currentValues: QuickConnectFormSchema) {
    if (!encryptionKeys) return;
    await submitRegistrationNoCode({
      profile: 'main',
      node_address: currentValues.node_address,
      registration_name: currentValues.registration_name,
      ...encryptionKeys,
    });
  }

  const onCancelConfirmation = () => {
    setResetStorageBeforeConnectConfirmationPrompt(false);
  };

  const onRestoreConfirmation = () => {
    setResetStorageBeforeConnectConfirmationPrompt(false);
  };

  const onResetConfirmation = () => {
    setResetStorageBeforeConnectConfirmationPrompt(false);
    onSubmit(setupDataForm.getValues());
  };

  if (
    shinkaiNodeEventState.type === ShinkaiNodeManagerEvent.PullingModelStart ||
    shinkaiNodeEventState.type === ShinkaiNodeManagerEvent.PullingModelProgress
  ) {
    const getBenefitList = () => {
      if (shinkaiNodeEventState?.payload?.model === 'snowflake-arctic-embed:xs')
        return [
          'desktop.model.embeddingBenefits.efficient' as const,
          'desktop.model.embeddingBenefits.highRetrieval' as const,
          'desktop.model.embeddingBenefits.dataAnalysis' as const,
        ];
      if (shinkaiNodeEventState?.payload?.model === 'llama3.1:8b-instruct-q4_1')
        return [
          'desktop.model.ollamaBenefits.resource' as const,
          'desktop.model.ollamaBenefits.language' as const,
          'desktop.model.ollamaBenefits.multilingual' as const,
        ];
      if (shinkaiNodeEventState?.payload?.model === 'gemma2:2b-instruct-q4_1')
        return [
          'desktop.model.gemmaBenefits.performance' as const,
          'desktop.model.gemmaBenefits.fast' as const,
          'desktop.model.gemmaBenefits.lightweight' as const,
        ];

      return [];
    };

    const renderTitle = () => {
      if (
        shinkaiNodeEventState.type === ShinkaiNodeManagerEvent.StartingOllama
      ) {
        return t('shinkaiNode.notifications.startingOllama');
      }
      if (
        shinkaiNodeEventState.type === ShinkaiNodeManagerEvent.OllamaStarted
      ) {
        return t('shinkaiNode.notifications.runningOllama');
      }
      if (
        shinkaiNodeEventState.type ===
          ShinkaiNodeManagerEvent.PullingModelStart ||
        shinkaiNodeEventState.type ===
          ShinkaiNodeManagerEvent.PullingModelProgress
      ) {
        return t('shinkaiNode.notifications.installingModel', {
          modelName: modelNameMap[shinkaiNodeEventState.payload?.model ?? ''],
        });
      }
    };
    return (
      <div
        className={cn(
          'bg-black-gradient fixed inset-0 z-10 mx-auto grid size-full h-full h-screen w-screen flex-col-reverse items-center px-[48px]',
        )}
      >
        <div className="bg-onboarding-card grid h-[calc(100dvh-100px)] grid-cols-2 content-center justify-center gap-y-10 rounded-2xl border-[#252528] px-[50px] py-[80px]">
          <div className="relative grid h-full place-items-center">
            <div className="absolute bottom-4 right-3 z-10 h-10 w-10 bg-[#141419]" />
            <video
              autoPlay
              className="h-full w-full mix-blend-screen"
              loop
              muted
              playsInline
              poster={downloadModelImg}
              ref={videoRef}
              src={downloadModelVideo}
            />
          </div>
          <div className="flex h-full w-full flex-col gap-10">
            <div className="space-between mx-auto flex h-full max-w-md flex-col">
              <h1 className="font-clash min-h-[100px] text-3xl font-semibold">
                {renderTitle()}
              </h1>
              <ul className="flex flex-col gap-3">
                {getBenefitList().map((text) => (
                  <li className="flex items-start gap-2" key={text}>
                    <CheckCircle className="mt-1.5 h-4 w-4 shrink-0" />
                    <span className="text-gray-80">
                      <Trans
                        components={{
                          b: <span className={'font-bold text-white'} />,
                        }}
                        i18nKey={text}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-span-2 mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-xl border border-gray-300 px-6 py-5">
            <Progress
              className="[&>*]:bg-brand h-2 w-full rounded-sm bg-gray-200"
              value={shinkaiNodeEventState?.payload?.progress ?? 0}
            />
            <div className="flex items-center justify-between text-sm text-white">
              <span>Downloading...</span>
              <span>{shinkaiNodeEventState?.payload?.progress ?? 0}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ResetStorageBeforeConnectConfirmationPrompt
        onCancel={() => onCancelConfirmation()}
        onReset={() => onResetConfirmation()}
        onRestore={() => onRestoreConfirmation()}
        open={resetStorageBeforeConnectConfirmationPromptOpen}
      />
      <div className="space-between flex h-full max-w-md flex-col gap-14">
        <h1 className="font-clash text-4xl font-semibold">
          {t('desktop.localAI')}
        </h1>
        <ul className="flex flex-col gap-4">
          {[
            'desktop.benefits.local' as const,
            'desktop.benefits.privacy' as const,
            'desktop.benefits.tools' as const,
          ].map((text) => (
            <li className="flex items-start gap-2" key={text}>
              <CheckCircle className="mt-1.5 h-4 w-4 shrink-0" />
              <span className="text-gray-80">
                <Trans
                  components={{
                    b: <span className={'font-bold text-white'} />,
                  }}
                  i18nKey={text}
                />
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-1 flex-col justify-end gap-4">
          <div className="space-y-4">
            <Button
              className="w-full"
              disabled={shinkaiNodeSpawnIsPending}
              isLoading={shinkaiNodeSpawnIsPending}
              onClick={() => shinkaiNodeSpawn()}
              size="lg"
            >
              {t('common.shinkaiPrivate')}
            </Button>
          </div>
          {/*<Separator className="relative" decorative>*/}
          {/*  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-500 p-2 text-gray-100">*/}
          {/*    or*/}
          {/*  </span>*/}
          {/*</Separator>*/}
          {config.isDev && (
            <div className="space-y-4">
              {/* Disable Shinkai Hosting */}
              {/*<a*/}
              {/*  className={cn(*/}
              {/*    buttonVariants({*/}
              {/*      variant: 'ghost',*/}
              {/*      size: 'lg',*/}
              {/*    }),*/}
              {/*    'w-full',*/}
              {/*  )}*/}
              {/*  href="https://www.shinkai.com/sign-in"*/}
              {/*  rel="noreferrer"*/}
              {/*  target="_blank"*/}
              {/*>*/}
              {/*  {t('common.logInShinkaiHosting')}*/}
              {/*</a>*/}
              {/*<a*/}
              {/*  className={cn(*/}
              {/*    buttonVariants({*/}
              {/*      variant: 'ghost',*/}
              {/*      size: 'lg',*/}
              {/*    }),*/}
              {/*    'w-full',*/}
              {/*  )}*/}
              {/*  href="https://www.shinkai.com/sign-up?plan=starter"*/}
              {/*  rel="noreferrer"*/}
              {/*  target="_blank"*/}
              {/*>*/}
              {/*  {t('common.signUpShinkaiHosting')}*/}
              {/*</a>*/}
              <div className="text-gray-80 items-center space-x-2 text-center text-base">
                <span>{t('common.alreadyHaveNode')}</span>
                <Link
                  className="font-semibold text-white underline"
                  to="/quick-connection"
                >
                  {t('common.quickConnect')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GetStartedPage;
