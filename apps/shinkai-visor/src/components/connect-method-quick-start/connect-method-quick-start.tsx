import { zodResolver } from '@hookform/resolvers/zod';
import { useSubmitRegistrationNoCode } from '@shinkai_network/shinkai-node-state/lib/mutations/submitRegistation/useSubmitRegistrationNoCode';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  ErrorMessage,
  Form,
  FormField,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { QrCode } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useHistory, useLocation } from 'react-router';
import { z } from 'zod';

import {
  Encryptionkeys,
  generateMyEncryptionKeys,
} from '../../helpers/encryption-keys';
import { SetupData, useAuth } from '../../store/auth/auth';
import { ConnectionMethodOption } from '../connection-method-option/connection-method-option';
import { Header } from '../header/header';

const formSchema = z.object({
  registration_name: z.string().min(5),
  node_address: z.string().url(),
  shinkai_identity: z
    .string()
    .regex(
      /^@@[a-zA-Z0-9_]+\.shinkai.*$/,
      `It should be in the format of @@<name>.shinkai`,
    )
    .optional(),
});

type FormType = z.infer<typeof formSchema>;

export const ConnectMethodQuickStart = () => {
  const history = useHistory();
  const location = useLocation<{ nodeAddress: string }>();
  const setAuth = useAuth((state) => state.setAuth);
  const DEFAULT_NODE_ADDRESS =
    location.state?.nodeAddress ?? 'http://127.0.0.1:9550';
  const [encryptionKeys, setEncryptedKeys] = useState<Encryptionkeys | null>(
    null,
  );
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      registration_name: 'main_device',
      node_address: DEFAULT_NODE_ADDRESS,
    },
  });
  const {
    isPending,
    mutateAsync: submitRegistration,
    isError: isSubmitError,
    error: submitError,
  } = useSubmitRegistrationNoCode({
    onSuccess: (response, setupPayload) => {
      if (response.success && encryptionKeys) {
        const authData: SetupData = {
          ...encryptionKeys,
          ...setupPayload,
          permission_type: '',
          shinkai_identity:
            setupPayload.shinkai_identity || (response.data?.node_name ?? ''),
          node_signature_pk: response.data?.identity_public_key ?? '',
          node_encryption_pk: response.data?.encryption_public_key ?? '',
        };
        setAuth(authData);
        history.replace('/inboxes');
      } else {
        throw new Error('Failed to submit registration');
      }
    },
  });

  const connect = async (values: FormType) => {
    let keys = encryptionKeys;
    if (!keys) {
      keys = await generateMyEncryptionKeys();
      setEncryptedKeys(keys);
    }
    await submitRegistration({
      profile: 'main',
      identity_type: 'device',
      permission_type: 'admin',
      shinkai_identity: values.shinkai_identity ?? '',
      registration_code: '',
      node_encryption_pk: '',
      node_address: values.node_address,
      registration_name: values.registration_name,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...keys,
    });
  };

  const selectQRCodeMethod = () => {
    history.push('/nodes/connect/method/qr-code');
  };
  const selectRestoreMethod = () => {
    history.push('/nodes/connect/method/restore-connection');
  };

  return (
    <div className="flex h-full flex-col justify-between gap-6 overflow-auto pr-2">
      <div>
        <Header
          description={
            <FormattedMessage id="quick-connection-connection-method-description" />
          }
          title={
            <FormattedMessage id="quick-connection-connection-method-title" />
          }
        />
        <Form {...form}>
          <form
            className="mt-8 space-y-5"
            onSubmit={form.handleSubmit(connect)}
          >
            <div className="flex flex-col justify-between gap-2">
              <FormField
                control={form.control}
                name="node_address"
                render={({ field }) => (
                  <TextField
                    field={field}
                    label={<FormattedMessage id="node-address" />}
                  />
                )}
              />

              <Accordion collapsible type="single">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="pl-2">
                    <FormattedMessage id="advanced-options" />
                  </AccordionTrigger>

                  <AccordionContent className="flex flex-col justify-between space-y-2 pb-0">
                    <FormField
                      control={form.control}
                      name="registration_name"
                      render={({ field }) => (
                        <TextField
                          field={field}
                          label={<FormattedMessage id="registration-name" />}
                        />
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shinkai_identity"
                      render={({ field }) => (
                        <TextField
                          field={field}
                          label={<FormattedMessage id="shinkai-identity" />}
                        />
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {isSubmitError && (
                <ErrorMessage
                  data-testid="quick-connect-error-message"
                  message={submitError?.message}
                />
              )}
            </div>
            <Button
              className="w-full"
              data-testid="quick-connect-button"
              disabled={isPending}
              isLoading={isPending}
              type="submit"
            >
              <FormattedMessage id="connect" />
            </Button>
          </form>
        </Form>
      </div>

      <div className="flex gap-4">
        <ConnectionMethodOption
          description={
            <FormattedMessage id="qr-code-connection-connection-method-description" />
          }
          icon={<QrCode className="text-gray-100" />}
          onClick={() => selectQRCodeMethod()}
          title={
            <FormattedMessage id="qr-code-connection-connection-method-title" />
          }
        />

        <ConnectionMethodOption
          description={
            <FormattedMessage id="restore-connection-connection-method-description" />
          }
          icon={
            <span aria-hidden className="text-base">
              🔑
            </span>
          }
          onClick={() => selectRestoreMethod()}
          title={
            <FormattedMessage id="restore-connection-connection-method-title" />
          }
        />
      </div>
    </div>
  );
};
