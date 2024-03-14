import { zodResolver } from '@hookform/resolvers/zod';
import { useSubmitRegistrationNoCode } from '@shinkai_network/shinkai-node-state/lib/mutations/submitRegistation/useSubmitRegistrationNoCode';
import { useGetEncryptionKeys } from '@shinkai_network/shinkai-node-state/lib/queries/getEncryptionKeys/useGetEncryptionKeys';
import {
  Button,
  ErrorMessage,
  Form,
  FormField,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { QrCode } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { HOME_PATH } from '../routes/name';
import { useAuth } from '../store/auth';
import { openShinkaiNodeManagerWindow } from '../windows/utils';
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

const ConnectionOptionButton = ({
  onClick,
  description,
  icon,
  title,
}: {
  onClick: () => void;
  title: string;
  description: string;
  icon: React.ReactNode;
}) => {
  return (
    <Button
      className="flex flex-1 cursor-pointer flex-col items-start gap-1 rounded-lg p-4 text-left"
      onClick={() => onClick()}
      size="auto"
      variant="ghost"
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

      <div className="text-gray-80 mt-2 flex flex-row items-center space-x-2 text-center text-sm">
        <p>{"Don't you have a Shinkai Node? "}</p>
        <Button
          className="p-0 text-sm font-semibold text-white underline"
          onClick={(e) => {
            openShinkaiNodeManagerWindow();
          }}
          variant={'link'}
        >
          Run it locally
        </Button>
      </div>

      <div className="mt-8 flex gap-4">
        <ConnectionOptionButton
          description={'Use the QR code to connect'}
          icon={<QrCode className="text-gray-100" />}
          onClick={() => {
            navigate('/');
          }}
          title={'QR Code'}
        />

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
    </OnboardingLayout>
  );
};

export default OnboardingPage;
