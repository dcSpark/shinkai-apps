import { zodResolver } from '@hookform/resolvers/zod';
import { encryptMessageWithPassphrase } from '@shinkai_network/shinkai-message-ts/cryptography';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { z } from 'zod';

import { useAuth } from '../../store/auth/auth';
import { Header } from '../header/header';

export const ExportConnection = () => {
  const intl = useIntl();
  const formSchema = z
    .object({
      passphrase: z.string().min(8),
      confirmPassphrase: z.string().min(8),
    })
    .superRefine(({ passphrase, confirmPassphrase }, ctx) => {
      if (passphrase !== confirmPassphrase) {
        ctx.addIssue({
          code: 'custom',
          message: intl.formatMessage({ id: 'passphrases-dont-match' }),
          path: ['confirmPassphrase'],
        });
      }
    });
  type FormSchemaType = z.infer<typeof formSchema>;
  const auth = useAuth((state) => state.auth);
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passphrase: '',
      confirmPassphrase: '',
    },
  });
  const passphrase = form.watch('passphrase');
  const confirmPassphrase = form.watch('confirmPassphrase');
  const [encryptedSetupData, setEncryptedSetupData] = useState<string>('');
  useEffect(() => {
    setEncryptedSetupData('');
  }, [passphrase, confirmPassphrase, setEncryptedSetupData]);
  const exportConnection = async (values: FormSchemaType): Promise<void> => {
    // TODO: Convert to a common format shared by visor, app and tray
    const parsedSetupData = JSON.stringify(auth);
    const encryptedSetupData = await encryptMessageWithPassphrase(
      parsedSetupData,
      values.passphrase,
    );
    setEncryptedSetupData(encryptedSetupData);
  };
  const download = (): void => {
    const link = document.createElement('a');
    const content = encryptedSetupData;
    const file = new Blob([content], { type: 'text/plain' });
    link.href = URL.createObjectURL(file);
    link.download = `${auth?.registration_name}.shinkai.key`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  return (
    <div className="flex h-full flex-col gap-8">
      <Header title={<FormattedMessage id="export-connection" />} />
      <div className="flex grow flex-col space-y-2">
        <Form {...form}>
          <form
            className="flex flex-col justify-between space-y-8"
            onSubmit={form.handleSubmit(exportConnection)}
          >
            <div className="flex grow flex-col space-y-2">
              <FormField
                control={form.control}
                name="passphrase"
                render={({ field }) => (
                  <TextField
                    field={field}
                    label={<FormattedMessage id="passphrase" />}
                    type="password"
                  />
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassphrase"
                render={({ field }) => (
                  <TextField
                    field={field}
                    label={<FormattedMessage id="confirm-passphrase" />}
                    type="password"
                  />
                )}
              />
            </div>
            <Button className="w-full" type="submit">
              <FormattedMessage id="generate-connection-file" />
            </Button>
          </form>
        </Form>

        {encryptedSetupData && (
          <div className=" flex grow flex-col items-center justify-center space-y-3">
            <div className="flex flex-col space-y-1">
              <span className="font-semibold">
                <FormattedMessage id="download-keep-safe-place" />
              </span>
              <span>
                <FormattedMessage id="use-it-to-restore" />
              </span>
            </div>
            <div className="flex w-full flex-row space-x-1">
              <div className="grow cursor-pointer" onClick={() => download()}>
                <Input
                  className="cursor-pointer truncate"
                  readOnly
                  value={encryptedSetupData}
                />
              </div>
              <Button className="" onClick={() => download()}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
