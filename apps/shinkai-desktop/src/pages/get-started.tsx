import { zodResolver } from '@hookform/resolvers/zod';
import {
  QuickConnectFormSchema,
  quickConnectFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/auth/quick-connection';
import { useSubmitRegistrationNoCode } from '@shinkai_network/shinkai-node-state/lib/mutations/submitRegistation/useSubmitRegistrationNoCode';
import { useGetEncryptionKeys } from '@shinkai_network/shinkai-node-state/lib/queries/getEncryptionKeys/useGetEncryptionKeys';
import { Button, buttonVariants, Separator } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { useShinkaiNodeSpawnMutation } from '../lib/shinkai-node-manager/shinkai-node-manager-client';
import { useShinkaiNodeEventsToast } from '../lib/shinkai-node-manager/shinkai-node-manager-hooks';
import { useAuth } from '../store/auth';
import OnboardingLayout from './layout/onboarding-layout';

const GetStartedPage = () => {
  const navigate = useNavigate();

  const setAuth = useAuth((state) => state.setAuth);
  useShinkaiNodeEventsToast();
  const { encryptionKeys } = useGetEncryptionKeys();
  const setupDataForm = useForm<QuickConnectFormSchema>({
    resolver: zodResolver(quickConnectFormSchema),
    defaultValues: {
      registration_name: 'main_device',
      node_address: 'http://127.0.0.1:9550',
    },
  });

  const { mutateAsync: submitRegistration } = useSubmitRegistrationNoCode({
    onSuccess: (response, setupPayload) => {
      if (response.success && encryptionKeys) {
        const updatedSetupData = {
          ...encryptionKeys,
          ...setupPayload,
          permission_type: '',
          shinkai_identity:
            setupPayload.shinkai_identity || (response.data?.node_name ?? ''),
          node_signature_pk: response.data?.identity_public_key ?? '',
          node_encryption_pk: response.data?.encryption_public_key ?? '',
        };
        setAuth(updatedSetupData);
        // Hide http subscription for now
        // navigate('/connect-ai');
        navigate('/ai-model-installation');
      } else {
        throw new Error('Failed to submit registration');
      }
    },
  });
  const {
    isPending: shinkaiNodeSpawnIsPending,
    mutateAsync: shinkaiNodeSpawn,
  } = useShinkaiNodeSpawnMutation({
    onSuccess: () => {
      onSubmit(setupDataForm.getValues());
    },
  });

  async function onSubmit(currentValues: QuickConnectFormSchema) {
    if (!encryptionKeys) return;
    await submitRegistration({
      profile: 'main',
      identity_type: 'device',
      permission_type: 'admin',
      shinkai_identity: currentValues.shinkai_identity ?? '',
      registration_code: '',
      node_encryption_pk: '',
      node_address: currentValues.node_address,
      registration_name: currentValues.registration_name,
      ...encryptionKeys,
    });
  }
  return (
    <OnboardingLayout>
      <div className="mx-auto flex h-full max-w-lg flex-col">
        <p className="text-gray-80 text-center text-base tracking-wide">
          Transform your desktop experience using AI with Shinkai Desktop{' '}
          <span aria-hidden> 🔑</span>
        </p>
        <div className="mt-20 flex flex-1 flex-col gap-10">
          <Button
            isLoading={shinkaiNodeSpawnIsPending}
            onClick={() => shinkaiNodeSpawn()}
            size="lg"
          >
            Shinkai Private (Local)
          </Button>
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
              Log In To Shinkai Hosting
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
              Sign up For Shinkai Hosting
            </a>
            <div className="text-gray-80 items-center space-x-2 text-center text-base">
              <span>Already have an Node?</span>
              <Link
                className="font-semibold text-white underline"
                to="/onboarding"
              >
                Quick Connect
              </Link>
            </div>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default GetStartedPage;
