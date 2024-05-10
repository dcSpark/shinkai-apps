import { zodResolver } from '@hookform/resolvers/zod';
import { decryptMessageWithPassphrase } from '@shinkai_network/shinkai-message-ts/cryptography/shinkai-encryption';
import {
  Button,
  buttonVariants,
  ErrorMessage,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ArrowLeft, Trash, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, To, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useAuth } from '../store/auth';
import OnboardingLayout from './layout/onboarding-layout';

const formSchema = z.object({
  encryptedConnection: z.string().min(1),
  passphrase: z.string().min(8),
});

const RestoreConnectionPage = () => {
  const setAuth = useAuth((state) => state.setAuth);
  const navigate = useNavigate();
  const [error, setError] = useState<boolean>(false);
  const [encryptedConnectionFile, setEncryptedConnectionFile] =
    useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      encryptedConnection: '',
      passphrase: '',
    },
  });

  const restore = async (values: z.infer<typeof formSchema>) => {
    try {
      const decryptedValue = await decryptMessageWithPassphrase(
        values.encryptedConnection,
        values.passphrase,
      );
      if (decryptedValue) {
        const decryptedSetupData = JSON.parse(decryptedValue);
        setAuth(decryptedSetupData);
        // TODO: Add logic to test if setup data is valid to create an authenticated connection with Shinkai Node
        navigate('/');
      }
    } catch (_) {
      setError(true);
    }
  };

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
  const removeConnectionFile = () => {
    form.setValue('encryptedConnection', '');
    setEncryptedConnectionFile(null);
  };

  return (
    <OnboardingLayout>
      <div className="flex h-full flex-col space-y-3">
        <div className="mb-4 flex items-center gap-2">
          <Link
            className={cn(
              buttonVariants({
                size: 'icon',
                variant: 'ghost',
              }),
            )}
            to={-1 as To}
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-left text-2xl font-semibold">
            Restore connection <span aria-hidden>🔑</span>
          </h1>
        </div>
        <p>Use a connection file and passphrase</p>

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
                      Encryption Connection
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-center">
                          {encryptedConnectionFile ? (
                            <div className="flex h-[100px] w-full flex-row items-center justify-center space-x-4 rounded-lg border border-dashed">
                              <div className="flex flex-row items-center">
                                <span className="text-gray-80 line-clamp-1 text-sm font-medium">
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
                                  Click to upload or drag and drop
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
                          <div className="truncate rounded-lg bg-gray-400 px-2 py-2 font-mono text-sm">
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
                  <TextField
                    field={field}
                    label={'Passphrase'}
                    type={'password'}
                  />
                )}
              />
              {error && <ErrorMessage message={'Invalid connection file'} />}
            </div>

            <Button className="w-full" type="submit">
              Restore connection
            </Button>
          </form>
        </Form>
      </div>
    </OnboardingLayout>
  );
};
export default RestoreConnectionPage;
