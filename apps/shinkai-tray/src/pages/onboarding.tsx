import { zodResolver } from '@hookform/resolvers/zod';
import {
  generateEncryptionKeys,
  generateSignatureKeys,
} from '@shinkai_network/shinkai-message-ts/utils';
import { queryClient } from '@shinkai_network/shinkai-node-state/lib/constants';
import { useSubmitRegistrationNoCode } from '@shinkai_network/shinkai-node-state/lib/mutations/submitRegistation/useSubmitRegistrationNoCode';
import {
  Button,
  ErrorMessage,
  Form,
  FormField,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { QrCode } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { HOME_PATH } from '../routes/name';
import { useAuth } from '../store/auth';
import OnboardingLayout from './layout/onboarding-layout';

const formSchema = z.object({
  registration_code: z.string(),
  profile: z.string(),
  registration_name: z.string(),
  identity_type: z.string(),
  permission_type: z.string(),
  node_address: z.string().url({
    message: 'Node Address must be a valid URL',
  }),
  shinkai_identity: z.string(),
  node_encryption_pk: z.string(),
  node_signature_pk: z.string(),
  profile_encryption_sk: z.string(),
  profile_encryption_pk: z.string(),
  profile_identity_sk: z.string(),
  profile_identity_pk: z.string(),
  my_device_encryption_sk: z.string(),
  my_device_encryption_pk: z.string(),
  my_device_identity_sk: z.string(),
  my_device_identity_pk: z.string(),
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
  const setLogout = useAuth((state) => state.setLogout);

  const setupDataForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      node_address: 'http://localhost:9550',
      registration_code: '',
      profile: 'main',
      registration_name: 'main_device',
      identity_type: 'device',
      permission_type: 'admin',
      shinkai_identity: '@@localhost.shinkai', // this should actually be read from ENV
      node_encryption_pk: '',
      node_signature_pk: '',
      profile_encryption_sk: '',
      profile_encryption_pk: '',
      profile_identity_sk: '',
      profile_identity_pk: '',
      my_device_encryption_sk: '',
      my_device_encryption_pk: '',
      my_device_identity_sk: '',
      my_device_identity_pk: '',
    },
  });

  const {
    isPending,
    isError,
    error,
    mutateAsync: submitRegistration,
  } = useSubmitRegistrationNoCode({
    onSuccess: (response) => {
      if (response.success) {
        const responseData = response.data;
        const updatedSetupData = {
          ...setupDataForm.getValues(),
          node_encryption_pk: responseData?.encryption_public_key ?? '',
          node_signature_pk: responseData?.identity_public_key ?? '',
        };
        setAuth(updatedSetupData);
        navigate(HOME_PATH);
      } else {
        throw new Error('Failed to submit registration');
      }
    },
  });

  useEffect(() => {
    // clean up
    setLogout();
    queryClient.clear();

    fetch('http://127.0.0.1:9550/v1/shinkai_health')
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'ok') {
          setupDataForm.setValue('node_address', 'http://127.0.0.1:9550');
        }
      })
      .catch((error) => console.error('Error:', error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate keys when the component mounts
  useEffect(() => {
    // Assuming the seed is a random 32 bytes array.
    // Device Keys
    let seed = crypto.getRandomValues(new Uint8Array(32));
    generateEncryptionKeys(seed).then(
      ({ my_encryption_sk_string, my_encryption_pk_string }) => {
        setupDataForm.setValue(
          'my_device_encryption_pk',
          my_encryption_pk_string,
        );
        setupDataForm.setValue(
          'my_device_encryption_sk',
          my_encryption_sk_string,
        );
      },
    );
    generateSignatureKeys().then(
      ({ my_identity_pk_string, my_identity_sk_string }) => {
        setupDataForm.setValue('my_device_identity_pk', my_identity_pk_string);
        setupDataForm.setValue('my_device_identity_sk', my_identity_sk_string);
      },
    );

    // Profile Keys
    seed = crypto.getRandomValues(new Uint8Array(32));
    generateEncryptionKeys(seed).then(
      ({ my_encryption_sk_string, my_encryption_pk_string }) => {
        setupDataForm.setValue(
          'profile_encryption_pk',
          my_encryption_pk_string,
        );
        setupDataForm.setValue(
          'profile_encryption_sk',
          my_encryption_sk_string,
        );
      },
    );
    generateSignatureKeys().then(
      ({ my_identity_pk_string, my_identity_sk_string }) => {
        setupDataForm.setValue('profile_identity_pk', my_identity_pk_string);
        setupDataForm.setValue('profile_identity_sk', my_identity_sk_string);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(currentValues: z.infer<typeof formSchema>) {
    await submitRegistration(currentValues);
  }

  return (
    <OnboardingLayout>
      <h1 className="mb-4 text-left text-2xl font-semibold">
        Quick Connection ⚡
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
