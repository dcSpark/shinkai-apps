import { zodResolver } from '@hookform/resolvers/zod';
import { useSubmitRegistrationNoCode } from '@shinkai_network/shinkai-node-state/lib/mutations/submitRegistation/useSubmitRegistrationNoCode';
import { Loader2 } from 'lucide-react';
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
});

type FormType = z.infer<typeof formSchema>;

export const ConnectMethodQuickStart = () => {
  const history = useHistory();
  const setAuth = useAuth((state) => state.setAuth);
  const DEFAULT_NODE_ADDRESS = 'http://127.0.0.1:9550';
  const [encryptionKeys, setEncryptedKeys] = useState<Encryptionkeys | null>(
    null
  );
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      registration_name: 'main_device',
      node_address: DEFAULT_NODE_ADDRESS,
    },
  });
  const {
    isLoading,
    mutateAsync: submitRegistration,
    isError: isSubmitError,
    error: submitError,
  } = useSubmitRegistrationNoCode({
    onSuccess: (response, setupPayload) => {
      console.log(response);
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
    if (!encryptionKeys) {
      const keys = await generateMyEncryptionKeys();
      setEncryptedKeys(keys);
    }
    submitRegistration({
      profile: 'main',
      identity_type: 'device',
      permission_type: 'admin',
      shinkai_identity: '@@localhost.shinkai',
      registration_code: '',
      node_encryption_pk: '',
      node_address: values.node_address,
      registration_name: values.registration_name,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...encryptionKeys!,
    });
  };

  return (
    <div className="h-full flex flex-col space-y-3">
      <div className="grow-0 flex flex-col space-y-1">
        <span className="text-xl">
          <FormattedMessage id="quick-connection-connection-method-title" />
        </span>
        <span className="text-xs">
          <FormattedMessage id="quick-connection-connection-method-description" />
        </span>
      </div>

      <Form {...form}>
        <form
          className="h-full flex flex-col space-y-2 justify-between"
          onSubmit={form.handleSubmit(connect)}
        >
          <div className="grow flex flex-col space-y-3">
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
            {isSubmitError && <ErrorMessage message={submitError?.message} />}
          </div>

          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <FormattedMessage id="connect" />
          </Button>
        </form>
      </Form>
    </div>
  );
};
