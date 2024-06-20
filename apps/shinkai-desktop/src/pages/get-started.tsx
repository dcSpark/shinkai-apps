import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  QuickConnectFormSchema,
  quickConnectFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/auth/quick-connection';
import { useSubmitRegistrationNoCode } from '@shinkai_network/shinkai-node-state/lib/mutations/submitRegistation/useSubmitRegistrationNoCode';
import { useGetEncryptionKeys } from '@shinkai_network/shinkai-node-state/lib/queries/getEncryptionKeys/useGetEncryptionKeys';
import { Button, buttonVariants, Separator } from '@shinkai_network/shinkai-ui';
import { submitRegistrationNoCodeError } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { ResourcesBanner } from '../components/hardware-capabilities/resources-banner';
import { ResetStorageBeforeConnectConfirmationPrompt } from '../components/reset-storage-before-connect-confirmation-prompt';
import {
  RequirementsStatus,
  useHardwareGetSummaryQuery,
} from '../lib/hardware.ts/hardware-client';
import { useShinkaiNodeSpawnMutation } from '../lib/shinkai-node-manager/shinkai-node-manager-client';
import { useShinkaiNodeEventsToast } from '../lib/shinkai-node-manager/shinkai-node-manager-hooks';
import { useAuth } from '../store/auth';
import OnboardingLayout from './layout/onboarding-layout';

const GetStartedPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const setAuth = useAuth((state) => state.setAuth);
  const [
    resetStorageBeforeConnectConfirmationPromptOpen,
    setResetStorageBeforeConnectConfirmationPrompt,
  ] = useState(false);
  useShinkaiNodeEventsToast();
  const { encryptionKeys } = useGetEncryptionKeys();
  const setupDataForm = useForm<QuickConnectFormSchema>({
    resolver: zodResolver(quickConnectFormSchema),
    defaultValues: {
      registration_name: 'main_device',
      node_address: 'http://127.0.0.1:9550',
    },
  });

  const { data: hardwareSummary } = useHardwareGetSummaryQuery();
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

  return (
    <OnboardingLayout>
      <ResetStorageBeforeConnectConfirmationPrompt
        onCancel={() => onCancelConfirmation()}
        onReset={() => onResetConfirmation()}
        onRestore={() => onRestoreConfirmation()}
        open={resetStorageBeforeConnectConfirmationPromptOpen}
      />
      <div className="mx-auto flex h-full max-w-lg flex-col">
        <p className="text-gray-80 text-center text-base tracking-wide">
          {t('desktop.welcome')} <span aria-hidden> 🔑</span>
        </p>
        <div className="mt-10 flex flex-1 flex-col gap-10">
          <div className="space-y-4">
            <Button
              className="w-full"
              disabled={
                hardwareSummary?.requirements_status ===
                RequirementsStatus.Unmeet
              }
              isLoading={shinkaiNodeSpawnIsPending}
              onClick={() => shinkaiNodeSpawn()}
              size="lg"
            >
              {t('common.shinkaiPrivate')}
            </Button>
            <ResourcesBanner />
          </div>
          <Separator className="relative" decorative>
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-500 p-2 text-gray-100">
              or
            </span>
          </Separator>
          <div className="space-y-4">
            <a
              className={cn(
                buttonVariants({
                  variant: 'ghost',
                  size: 'lg',
                }),
                'w-full',
              )}
              href="https://www.shinkai.com/sign-in"
              rel="noreferrer"
              target="_blank"
            >
              {t('common.logInShinkaiHosting')}
            </a>
            <a
              className={cn(
                buttonVariants({
                  variant: 'ghost',
                  size: 'lg',
                }),
                'w-full',
              )}
              href="https://www.shinkai.com/sign-up?plan=starter"
              rel="noreferrer"
              target="_blank"
            >
              {t('common.signUpShinkaiHosting')}
            </a>
            <div className="text-gray-80 items-center space-x-2 text-center text-base">
              <span>{t('common.alreadyHaveNode')}</span>
              <Link
                className="font-semibold text-white underline"
                to="/onboarding"
              >
                {t('common.quickConnect')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default GetStartedPage;
