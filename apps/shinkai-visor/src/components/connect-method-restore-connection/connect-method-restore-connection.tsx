import { zodResolver } from '@hookform/resolvers/zod';
import { decryptMessageWithPassphrase } from '@shinkai_network/shinkai-message-ts/cryptography';
import {
  Button,
  ErrorMessage,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  PaperClipIcon,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { Trash, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { Accept, useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';
import { z } from 'zod';

import { useAuth } from '../../store/auth/auth';
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
                        <FileInput
                          accept={{
                            'application/x-iwork-keynote-sffkey': ['.key'],
                          }}
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

const FileInput = ({
  value,
  onChange,
  maxFiles,
  accept,
  multiple,
}: {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  accept?: Accept;
  multiple?: boolean;
}) => {
  const { getRootProps: getRootFileProps, getInputProps: getInputFileProps } =
    useDropzone({
      multiple: multiple,
      maxFiles: maxFiles ?? 5,
      accept,
      onDrop: (acceptedFiles) => {
        onChange(acceptedFiles);
      },
    });

  return (
    <div className="flex w-full flex-col gap-2">
      <div
        {...getRootFileProps({
          className:
            'dropzone py-4 bg-gray-400 group relative mt-3 flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-100 transition-colors hover:border-white',
        })}
      >
        <div className="flex flex-col items-center justify-center space-y-1">
          <div>
            <Upload className="h-4 w-4" />
          </div>
          <p className="text-sm text-white">
            <FormattedMessage id="click-to-upload" />
          </p>
          <p className="text-gray-80 text-xs">Eg: shinkai.key</p>
        </div>

        <input {...getInputFileProps({})} />
      </div>
      {!!value?.length && (
        <div className="flex flex-col gap-2">
          {value?.map((file, idx) => (
            <div
              className="relative flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-1.5"
              key={idx}
            >
              <PaperClipIcon className="text-gray-100" />
              <span className="text-gray-80 flex-1 truncate text-sm">
                {file.name}
              </span>
              <Button
                onClick={() => {
                  const newFiles = [...value];
                  newFiles.splice(newFiles.indexOf(file), 1);
                  onChange(newFiles);
                }}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Trash className="h-4 w-4 text-gray-100" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
