import { zodResolver } from '@hookform/resolvers/zod';
import { decryptMessageWithPassphrase } from '@shinkai_network/shinkai-message-ts/cryptography';
import { FileKey, PlugZap, Trash, Upload } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';
import { z } from 'zod';

import { useAuth } from '../../store/auth/auth';
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
      console.log('onload event', event);
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
        values.passphrase
      );
      if (decryptedValue) {
        const decryptedSetupData = JSON.parse(decryptedValue);

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
    <div className="h-full flex flex-col space-y-3">
      <Header
        description={
          <FormattedMessage id="restore-connection-connection-method-description" />
        }
        icon={<FileKey />}
        title={
          <FormattedMessage id="restore-connection-connection-method-title" />
        }
      />

      <Form {...form}>
        <form
          className="h-full flex flex-col space-y-2 justify-between"
          onSubmit={form.handleSubmit(restore)}
        >
          <div className="grow flex flex-col space-y-3">
            <FormField
              control={form.control}
              disabled={true}
              name="encryptedConnection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage id="encrypted-connection" />
                  </FormLabel>
                  <FormControl>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-center">
                        {encryptedConnectionFile ? (
                          <div className="flex flex-row justify-center items-center rounded-lg border border-dashed w-full h-[100px] space-x-4">
                            <div className="flex flex-row items-center">
                              <FileKey className="w-4 h-4 space-x-1 mr-1" />
                              <span className="font-semibold">
                                {encryptedConnectionFile.name}
                              </span>
                            </div>
                            <Button
                              className="h-6 w-6"
                              onClick={() => removeConnectionFile()}
                              size="icon"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <label
                            className="flex flex-col items-center justify-center w-full h-[100px] border-2 border-dashed rounded-lg cursor-pointer bg-secondary-600 hover:bg-secondary-600"
                            htmlFor="dropzone-file"
                          >
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <div>
                                <Upload className="w-4 h-4" />
                              </div>
                              <p className="text-sm text-gray-500">
                                <FormattedMessage id="click-to-upload" />
                              </p>
                              <p className="text-xs text-gray-500">
                                SHINKAI.KEY
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
                        <Input {...field} className="truncate" />
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
                  <FormLabel>
                    <FormattedMessage id="passphrase" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <ErrorMessage message={'Invalid connection file'} />}
          </div>

          <Button className="w-full" type="submit">
            <PlugZap className="mr-2 h-4 w-4" />
            <FormattedMessage id="restore-connection" />
          </Button>
        </form>
      </Form>
    </div>
  );
};
