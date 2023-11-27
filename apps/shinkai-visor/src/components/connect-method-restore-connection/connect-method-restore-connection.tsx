import { zodResolver } from '@hookform/resolvers/zod';
import { decryptMessageWithPassphrase } from '@shinkai_network/shinkai-message-ts/cryptography';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@shinkai_network/shinkai-ui';
import { FileKey, PlugZap, Trash, Upload } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';
import { z } from 'zod';

import { useAuth } from '../../store/auth/auth';
import { Header } from '../header/header';
import ErrorMessage from '../ui/error-message';

const formSchema = z.object({
  encryptedConnection: z.string().min(1),
  passphrase: z.string().min(8),
});

type FormType = z.infer<typeof formSchema>;

export const ConnectMethodRestoreConnection = () => {
  const history = useHistory();
  const setAuth = useAuth((state) => state.setAuth);
  const [error, setError] = useState<boolean>(false);
  const [encryptedConnectionFile, setEncryptedConnectionFile] =
    useState<File | null>(null);
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      encryptedConnection: '',
      passphrase: '',
    },
  });
  const onConnectionFileSelected: React.ChangeEventHandler<
    HTMLInputElement
  > = async (event): Promise<void> => {
    if (!event.target.files || !event.target.files[0]) {
      return;
    }
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = (event) => {
      if (event?.target?.readyState !== event?.target?.DONE) {
        return;
      }
      const encryptedConnection = event?.target?.result as string;
      if (!encryptedConnection.startsWith('encrypted:')) {
        return;
      }
      setEncryptedConnectionFile(file);
      form.setValue('encryptedConnection', encryptedConnection);
    };
  };
  const restore = async (values: FormType) => {
    try {
      const decryptedValue = await decryptMessageWithPassphrase(
        values.encryptedConnection,
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
  const removeConnectionFile = () => {
    form.setValue('encryptedConnection', '');
    setEncryptedConnectionFile(null);
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
              name="encryptedConnection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">
                    <FormattedMessage id="encrypted-connection" />
                  </FormLabel>
                  <FormControl>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-center">
                        {encryptedConnectionFile ? (
                          <div className="flex h-[100px] w-full flex-row items-center justify-center space-x-4 rounded-lg border border-dashed">
                            <div className="flex flex-row items-center">
                              <span className="text-gray-80 font-medium uppercase">
                                {encryptedConnectionFile.name}
                              </span>
                            </div>
                            <Button
                              className="h-6 w-6"
                              onClick={() => removeConnectionFile()}
                              size="icon"
                              type="button"
                              variant={'ghost'}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <label
                            className="flex h-[100px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-100 bg-gray-400"
                            htmlFor="dropzone-file"
                          >
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <div>
                                <Upload className="h-4 w-4" />
                              </div>
                              <p className="text-sm text-white">
                                <FormattedMessage id="click-to-upload" />
                              </p>
                              <p className="text-gray-80 text-xs">
                                Eg: shinkai.key
                              </p>
                            </div>
                            <input
                              accept=".key"
                              alt="shinaki conection file input"
                              className="hidden"
                              id="dropzone-file"
                              onChange={(event) =>
                                onConnectionFileSelected(event)
                              }
                              type="file"
                            />
                          </label>
                        )}
                      </div>
                      {encryptedConnectionFile && (
                        <div className="truncate rounded-lg bg-gray-400 px-2 py-2">
                          {field.value}
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
                <FormItem>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormLabel>
                    <FormattedMessage id="passphrase" />
                  </FormLabel>
                  <FormMessage />
                </FormItem>
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
