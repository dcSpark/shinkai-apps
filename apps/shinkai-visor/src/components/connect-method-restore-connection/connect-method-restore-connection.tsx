import { zodResolver } from '@hookform/resolvers/zod';
import { decryptMessageWithPassphrase } from '@shinkai_network/shinkai-message-ts/cryptography';
import { useAuth } from '@shinkai_network/shinkai-node-state/store/auth';
import {
  Button,
  ErrorMessage,
  FileUploader,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  TextField,
} from '@shinkai_network/shinkai-ui';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';
import { z } from 'zod';

import { Header } from '../header/header';

const formSchema = z.object({
  passphrase: z.string().min(8),
  encryptedConnectionFile: z.array(z.any()).max(1),
});

type FormType = z.infer<typeof formSchema>;

export const ConnectMethodRestoreConnection = () => {
  const history = useHistory();
  const setAuth = useAuth((state) => state.setAuth);
  const [error, setError] = useState<boolean>(false);

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passphrase: '',
    },
  });

  const encryptedConnectionFileValue = form.watch('encryptedConnectionFile');
  const onConnectionFileSelected = async (files: File[]) => {
    const file = files[0];
    try {
      const encryptedConnection = await file.text();
      if (!encryptedConnection.startsWith('encrypted:')) {
        return;
      }
      const fileWithEncryptedConnection = Object.assign(file, {
        encryptedConnection,
      });
      form.setValue('encryptedConnectionFile', [fileWithEncryptedConnection], {
        shouldValidate: true,
      });
    } catch (error) {
      console.error('Error reading file:', error);
    }
  };
  const restore = async (values: FormType) => {
    try {
      const decryptedValue = await decryptMessageWithPassphrase(
        values.encryptedConnectionFile[0].encryptedConnection,
        values.passphrase,
      );
      if (decryptedValue) {
        const decryptedSetupData = JSON.parse(decryptedValue);
        console.log('auth', decryptedSetupData);
        setAuth(decryptedSetupData);
        // TODO: Add logic to test if setup data is valid to create an authenticated connection with Shinkai Node
        history.replace('/inboxes');
      }
    } catch (_) {
      setError(true);
    }
  };

  return (
    <div className="flex h-full flex-col space-y-3">
      <Header
        description={
          <FormattedMessage id="restore-connection-connection-method-description" />
        }
        title={
          <FormattedMessage id="restore-connection-connection-method-title" />
        }
      />

      <Form {...form}>
        <form
          className="flex h-full flex-col justify-between space-y-2"
          onSubmit={form.handleSubmit(restore)}
        >
          <div className="flex grow flex-col space-y-3">
            <FormField
              control={form.control}
              disabled={true}
              name="encryptedConnectionFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">
                    <FormattedMessage id="encrypted-connection" />
                  </FormLabel>
                  <FormControl>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-center">
                        <FileUploader
                          accept={['.key'].join(',')}
                          descriptionText="Eg: shinkai.key"
                          maxFiles={1}
                          onChange={(acceptedFiles) => {
                            onConnectionFileSelected(acceptedFiles);
                            field.onChange(acceptedFiles);
                          }}
                          value={field.value}
                        />
                      </div>
                      {!!encryptedConnectionFileValue?.length && (
                        <div className="truncate rounded-lg bg-gray-400 px-2 py-2">
                          {encryptedConnectionFileValue[0].encryptedConnection}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passphrase"
              render={({ field }) => (
                <TextField
                  field={field}
                  label={<FormattedMessage id="passphrase" />}
                  type={'password'}
                />
              )}
            />
            {error && <ErrorMessage message={'Invalid connection file'} />}
          </div>

          <Button className="w-full" type="submit">
            <FormattedMessage id="restore-connection" />
          </Button>
        </form>
      </Form>
    </div>
  );
};
