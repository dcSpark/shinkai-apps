import { zodResolver } from '@hookform/resolvers/zod';
import { useSubmitRegistrationNoCode } from '@shinkai_network/shinkai-node-state/lib/mutations/submitRegistation/useSubmitRegistrationNoCode';
import { FileKey, Loader2, PlugZap, QrCode, Zap } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';
import { z } from 'zod';

import {
  Encryptionkeys,
  generateMyEncryptionKeys,
} from '../../helpers/encryption-keys';
import { SetupData, useAuth } from '../../store/auth/auth';
import { ConnectionMethodOption } from '../connection-method-option/connection-method-option';
import { Header } from '../header/header';
import { Button } from '../ui/button';
import ErrorMessage from '../ui/error-message';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';

const formSchema = z.object({
  registration_name: z.string().min(5),
  node_address: z.string().url(),
  shinkai_identity: z.string().min(11),
});

type FormType = z.infer<typeof formSchema>;

export const ConnectMethodQuickStart = () => {
  const history = useHistory();
  const setAuth = useAuth((state) => state.setAuth);
  const DEFAULT_NODE_ADDRESS = 'http://127.0.0.1:9550';
  const DEFAULT_SHINKAI_IDENTITY = '@@localhost.shinkai';
  const [encryptionKeys, setEncryptedKeys] = useState<Encryptionkeys | null>(
    null
  );
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      registration_name: 'main_device',
      node_address: DEFAULT_NODE_ADDRESS,
      shinkai_identity: DEFAULT_SHINKAI_IDENTITY,
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
    submitRegistration({
      profile: 'main',
      identity_type: 'device',
      permission_type: 'admin',
      shinkai_identity: values.shinkai_identity,
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
    <div className="h-full flex flex-col space-y-3">
      <Header
        description={
          <FormattedMessage id="quick-connection-connection-method-description" />
        }
        icon={<Zap />}
        title={
          <FormattedMessage id="quick-connection-connection-method-title" />
        }
      />
      <Form {...form}>
        <form
          className="flex flex-col space-y-2 justify-between"
          onSubmit={form.handleSubmit(connect)}
        >
          <FormField
            control={form.control}
            name="node_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <FormattedMessage id="node-address" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registration_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <FormattedMessage id="registration-name" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shinkai_identity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <FormattedMessage id="shinkai-identity" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isSubmitError && <ErrorMessage message={submitError?.message} />}

          <Button className="w-full" disabled={isPending} type="submit">
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlugZap className="mr-2 h-4 w-4" />
            )}
            <FormattedMessage id="connect" />
          </Button>
        </form>
      </Form>

      <div className="grow flex flex-col space-y-1 justify-end">
        <span className="font-semibold">
          <FormattedMessage id="did-you-connected-before" />
        </span>

        <ConnectionMethodOption
          description={
            <FormattedMessage id="qr-code-connection-connection-method-description" />
          }
          icon={<QrCode />}
          onClick={() => selectQRCodeMethod()}
          title={
            <FormattedMessage id="qr-code-connection-connection-method-title" />
          }
        />

        <ConnectionMethodOption
          description={
            <FormattedMessage id="restore-connection-connection-method-description" />
          }
          icon={<FileKey />}
          onClick={() => selectRestoreMethod()}
          title={
            <FormattedMessage id="restore-connection-connection-method-title" />
          }
        />
      </div>
    </div>
  );
};
