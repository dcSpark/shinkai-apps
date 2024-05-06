import { zodResolver } from '@hookform/resolvers/zod';
import { useSubmitRegistrationNoCode } from '@shinkai_network/shinkai-node-state/lib/mutations/submitRegistation/useSubmitRegistrationNoCode';
import { useGetEncryptionKeys } from '@shinkai_network/shinkai-node-state/lib/queries/getEncryptionKeys/useGetEncryptionKeys';
import {
  Button,
  ButtonProps,
  ErrorMessage,
  Form,
  FormField,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { HOME_PATH } from '../routes/name';
import { useAuth } from '../store/auth';
import { useShinkaiNodeEventsToast } from '../windows/shinkai-node-manager/shinkai-node-manager-hooks';
import { useShinkaiNodeSpawnMutation } from '../windows/shinkai-node-manager/shinkai-node-process-client';
import OnboardingLayout from './layout/onboarding-layout';

const formSchema = z.object({
  registration_name: z.string().min(5),
  node_address: z.string().url({
    message: 'Node Address must be a valid URL',
  }),
  shinkai_identity: z
    .string()
    .regex(
      /^@@[a-zA-Z0-9_]+\.shinkai.*$/,
      `It should be in the format of @@<name>.shinkai`,
    )
    .nullish(),
});

export interface ConnectionOptionButtonProps extends ButtonProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}
const ConnectionOptionButton = ({
  description,
  icon,
  title,
  className,
  ...props
}: ConnectionOptionButtonProps) => {
  return (
    <Button
      className={cn(
        'flex flex-1 cursor-pointer flex-col items-start gap-1 rounded-lg p-4 text-left',
        className,
      )}
      size="auto"
      variant="ghost"
      {...props}
    >
      <div className="">{icon}</div>
      <p className="text-[15px] font-medium leading-none">{title}</p>
      <p className="text-xs text-gray-100">{description}</p>
    </Button>
  );
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuth((state) => state.setAuth);
  useShinkaiNodeEventsToast();
  const { encryptionKeys } = useGetEncryptionKeys();

  const setupDataForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      registration_name: 'main_device',
      node_address: 'http://127.0.0.1:9550',
    },
  });

  const {
    isPending,
    isError,
    error,
    mutateAsync: submitRegistration,
  } = useSubmitRegistrationNoCode({
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
        navigate(HOME_PATH);
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

  async function onSubmit(currentValues: z.infer<typeof formSchema>) {
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...encryptionKeys,
    });
  }

  return (
    <OnboardingLayout>
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-col">
          <h1 className="mb-4 text-left text-2xl font-semibold">
            Quick Connection <span aria-hidden>⚡</span>
          </h1>
          <Form {...setupDataForm}>
            <form
              className="space-y-6"
              onSubmit={setupDataForm.handleSubmit(onSubmit)}
            >
              <div className="space-y-4">
                <FormField
                  control={setupDataForm.control}
                  name="node_address"
                  render={({ field }) => (
                    <TextField field={field} label={'Node Address'} />
                  )}
                />
                {isError && <ErrorMessage message={error.message} />}
              </div>
              <Button
                className="w-full"
                disabled={isPending}
                isLoading={isPending}
                type="submit"
                variant="default"
              >
                Connect
              </Button>
            </form>
          </Form>

          <div className="mt-8 flex flex-col">
            <span className="text-md text-gray-50">Shinkai as a service</span>
            <div className="text-gray-80 mt-2 flex flex-row items-center space-x-2 text-center text-sm">
              <p>{'Don’t have an account? '}</p>
              <a
                className="font-semibold text-white underline"
                href="https://www.shinkai.com/sign-up"
                rel="noreferrer"
                target={'_blank'}
              >
                Sign up
              </a>
            </div>
            <div className="text-gray-80 mt-1 flex flex-row items-center space-x-2 text-center text-sm">
              <p>{'Already have an account? '}</p>
              <a
                className="font-semibold text-white underline"
                href="https://www.shinkai.com/user"
                rel="noreferrer"
                target={'_blank'}
              >
                Click here to connect
              </a>
            </div>
          </div>

          <div className="mt-8 flex flex-col">
            <span className="text-md text-gray-50">Shinkai locally</span>
            <div className="text-gray-80 mt-2 flex flex-row items-center space-x-2 text-center text-sm">
              <p>{"Don't have a node? "}</p>
              {shinkaiNodeSpawnIsPending && (
                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
              )}
              <span
                className="ml-2 cursor-pointer p-0 text-sm font-semibold text-white underline"
                onClick={() => {
                  if (shinkaiNodeSpawnIsPending) {
                    return;
                  }
                  shinkaiNodeSpawn();
                }}
              >
                Run it locally
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-row justify-between gap-4">
          {/*<ConnectionOptionButton*/}
          {/*  className="h-32"*/}
          {/*  description={'Use the QR code to connect'}*/}
          {/*  icon={<QrCode className="text-gray-100" />}*/}
          {/*  onClick={() => {*/}
          {/*    navigate('/connect-qr');*/}
          {/*  }}*/}
          {/*  title={'QR Code'}*/}
          {/*/>*/}

          <ConnectionOptionButton
            description={'Use a connection file and passphrase'}
            icon={
              <span aria-hidden className="text-base">
                🔑
              </span>
            }
            onClick={() => {
              navigate('/restore');
            }}
            title={'Restore'}
          />
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default OnboardingPage;
