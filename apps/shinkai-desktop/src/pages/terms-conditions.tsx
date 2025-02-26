import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  QuickConnectFormSchema,
  quickConnectFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/auth/quick-connection';
import { useSubmitRegistrationNoCode } from '@shinkai_network/shinkai-node-state/v2/mutations/submitRegistation/useSubmitRegistrationNoCode';
import { useGetEncryptionKeys } from '@shinkai_network/shinkai-node-state/v2/queries/getEncryptionKeys/useGetEncryptionKeys';
import { Button, buttonVariants, Checkbox } from '@shinkai_network/shinkai-ui';
import { submitRegistrationNoCodeError } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { OnboardingStep } from '../components/onboarding/constants';
import { ResetStorageBeforeConnectConfirmationPrompt } from '../components/reset-storage-before-connect-confirmation-prompt';
import config from '../config';
import { useShinkaiNodeRemoveStorageMutation } from '../lib/shinkai-node-manager/shinkai-node-manager-client';
import { useShinkaiNodeSpawnMutation } from '../lib/shinkai-node-manager/shinkai-node-manager-client';
import { useShinkaiNodeKillMutation } from '../lib/shinkai-node-manager/shinkai-node-manager-client';
// import { useShinkaiNodeEventsToast } from '../lib/shinkai-node-manager/shinkai-node-manager-hooks';
import { useStepNavigation } from '../routes';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';

const TermsAndConditionsPage = () => {
  const { t, Trans } = useTranslation();
  const [termsAndConditionsAccepted, setTermsAndConditionsAccepted] =
    useState(false);
  // useShinkaiNodeEventsToast();

  const completeStep = useSettings((state) => state.completeStep);

  useStepNavigation(OnboardingStep.TERMS_CONDITIONS);

  const setAuth = useAuth((state) => state.setAuth);
  const [
    resetStorageBeforeConnectConfirmationPromptOpen,
    setResetStorageBeforeConnectConfirmationPrompt,
  ] = useState(false);

  const { encryptionKeys } = useGetEncryptionKeys();
  const setupDataForm = useForm<QuickConnectFormSchema>({
    resolver: zodResolver(quickConnectFormSchema),
    defaultValues: {
      registration_name: 'main_device',
      node_address: 'http://127.0.0.1:9550',
    },
  });

  const {
    mutateAsync: submitRegistrationNoCode,
    isPending: submitRegistrationNodeCodeIsPending,
  } = useSubmitRegistrationNoCode({
    onSuccess: (response, setupPayload) => {
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
        completeStep(OnboardingStep.TERMS_CONDITIONS, true);
      } else if (response.status === 'non-pristine') {
        setResetStorageBeforeConnectConfirmationPrompt(true);
      } else {
        submitRegistrationNoCodeError();
      }
    },
  });
  const { isPending: shinkaiNodeRemoveStorageIsPending } =
    useShinkaiNodeRemoveStorageMutation();
  const {
    isPending: shinkaiNodeSpawnIsPending,
    mutateAsync: shinkaiNodeSpawn,
  } = useShinkaiNodeSpawnMutation({
    onSuccess: () => {
      onSubmit(setupDataForm.getValues());
    },
  });
  const { isPending: shinkaiNodeKillIsPending } = useShinkaiNodeKillMutation();

  const isStartLocalButtonLoading =
    shinkaiNodeSpawnIsPending ||
    shinkaiNodeKillIsPending ||
    shinkaiNodeRemoveStorageIsPending ||
    submitRegistrationNodeCodeIsPending;

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
    <div className="flex h-full flex-col justify-between gap-10">
      <div className="space-y-5">
        <h1 className="font-clash text-4xl font-semibold">
          {t('desktop.welcome')}
        </h1>
        <p className="text-gray-80 text-base">
          {t('desktop.welcomeDescription')}
        </p>
      </div>
      <div className="flex gap-3">
        <Checkbox
          checked={termsAndConditionsAccepted}
          id="terms"
          onCheckedChange={(checked) =>
            setTermsAndConditionsAccepted(checked as boolean)
          }
        />
        <label
          className="inline-block cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="terms"
        >
          <span className={'leading-4 tracking-wide'}>
            <Trans
              components={{
                a: (
                  <a
                    className={'text-white underline'}
                    href={'https://www.shinkai.com/terms-of-service'}
                    rel="noreferrer"
                    target={'_blank'}
                  />
                ),
                b: (
                  <a
                    className={'text-white underline'}
                    href={'https://www.shinkai.com/privacy-policy'}
                    rel="noreferrer"
                    target={'_blank'}
                  />
                ),
              }}
              i18nKey="common.termsAndConditionsText"
            />
          </span>
        </label>
      </div>

      <div className="flex flex-1 flex-col justify-end gap-4">
        <Button
          className={cn(
            buttonVariants({
              variant: 'default',
              size: 'lg',
            }),
          )}
          disabled={!termsAndConditionsAccepted || isStartLocalButtonLoading}
          isLoading={isStartLocalButtonLoading}
          onClick={() => shinkaiNodeSpawn()}
        >
          {t('common.getStarted')}
        </Button>

        {config.isDev && (
          <div className="text-gray-80 items-center space-x-2 text-center text-base">
            <span>{t('common.alreadyHaveNode')}</span>
            <Link
              className="font-semibold text-white underline"
              to="/quick-connection"
            >
              {t('common.quickConnect')}
            </Link>
          </div>
        )}
      </div>
      <ResetStorageBeforeConnectConfirmationPrompt
        onCancel={() => onCancelConfirmation()}
        onReset={() => onResetConfirmation()}
        onRestore={() => onRestoreConfirmation()}
        open={resetStorageBeforeConnectConfirmationPromptOpen}
      />
    </div>
  );
};

export default TermsAndConditionsPage;
