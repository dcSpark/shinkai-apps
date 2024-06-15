import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { encryptMessageWithPassphrase } from '@shinkai_network/shinkai-message-ts/cryptography';
import {
  ExportConnectionFormSchema,
  exportConnectionFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/settings/export-connection';
import {
  Button,
  Form,
  FormField,
  Input,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuth } from '../../store/auth/auth';
import { Header } from '../header/header';

export const ExportConnection = () => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const form = useForm<ExportConnectionFormSchema>({
    resolver: zodResolver(exportConnectionFormSchema),
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
  const exportConnection = async (
    values: ExportConnectionFormSchema,
  ): Promise<void> => {
    // TODO: Convert to a common format shared by visor, app and desktop
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
    link.download =
      `${auth?.shinkai_identity}_${auth?.registration_name}.shinkai.key`
        .replace(/@/g, '')
        .replace(/\//g, '_');
    link.click();
    URL.revokeObjectURL(link.href);
  };
  return (
    <div className="flex h-full flex-col gap-8">
      <Header title={t('exportConnection.label')} />
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
                    label={t('common.passphrase')}
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
                    label={t('common.repeatPassphrase')}
                    type="password"
                  />
                )}
              />
            </div>
            <Button className="w-full" type="submit">
              {t('exportConnection.generateFile')}
            </Button>
          </form>
        </Form>

        {encryptedSetupData && (
          <div className="flex grow flex-col items-center justify-center space-y-3">
            <div className="flex flex-col space-y-1">
              <span className="font-semibold">
                {t('exportConnection.downloadText')}
              </span>
              <span>{t('exportConnection.restoreText')}</span>
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
