import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  Button,
  buttonVariants,
  CopyToClipboardIcon,
  Form,
  FormField,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ExternalLinkIcon, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  useGalxeGenerateDesktopInstallationProofQuery,
  useGalxeRegisterShinkaiDesktopInstallationMutation,
} from '../lib/galxe/galxe-client';
import { useAuth } from '../store/auth';
import { SubpageLayout } from './layout/simple-layout';

export const RegisterShinkaiDesktopInstallationFormSchema = z.object({
  address: z.string().min(42),
  signature: z.string().min(8),
  combined: z.string().min(8),
});
export type RegisterShinkaiDesktopInstallationForm = z.infer<
  typeof RegisterShinkaiDesktopInstallationFormSchema
>;

export const GalxeValidation = () => {
  const { t } = useTranslation();
  const auth = useAuth((store) => store.auth);
  const { data: installationProof } =
    useGalxeGenerateDesktopInstallationProofQuery(
      auth?.node_signature_pk || '',
    );
  const form = useForm<RegisterShinkaiDesktopInstallationForm>({
    resolver: zodResolver(RegisterShinkaiDesktopInstallationFormSchema),
    defaultValues: {
      address: '',
      signature: installationProof?.[0],
      combined: installationProof?.[1],
    },
  });

  const { mutateAsync: registerShinkaiDesktopInstallation, isPending } =
    useGalxeRegisterShinkaiDesktopInstallationMutation({
      onSuccess: () => {
        toast.success(t('galxe.success.registerDesktopInstallation'));
      },
      onError: (error) => {
        toast.error(t('galxe.errors.registerDesktopInstallation'), {
          description: error?.response?.data?.message ?? error.message,
        });
      },
    });

  const register = (values: RegisterShinkaiDesktopInstallationForm) => {
    registerShinkaiDesktopInstallation({ ...values });
  };

  useEffect(() => {
    form.setValue('signature', installationProof?.[0] ?? '');
    form.setValue('combined', installationProof?.[1] ?? '');
  }, [installationProof, form]);

  return (
    <SubpageLayout title={t('galxe.label')}>
      <div className="flex grow flex-col space-y-2">
        <span className="text-gray-80 inline-flex items-center gap-1 px-1 py-2.5 hover:text-white">
          <a
            className={cn(
              buttonVariants({
                size: 'auto',
                variant: 'link',
              }),
              'rounded-lg p-0 text-xs text-inherit underline',
            )}
            href={`https://app.galxe.com/quest/shinkai/GCeQitd47H`}
            rel="noreferrer"
            target="_blank"
          >
            {t('galxe.goToGalxeQuest')}
          </a>
          <ExternalLinkIcon className="h-4 w-4" />
        </span>
        <Form {...form}>
          <form
            className="flex flex-col justify-between space-y-8"
            onSubmit={form.handleSubmit(register)}
          >
            <div className="flex grow flex-col space-y-5">
              <div>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <TextField
                        classes={{
                          input: 'font-mono',
                        }}
                        endAdornment={
                          <div className="w-8">
                            <CopyToClipboardIcon
                              className="peer/adornment adornment absolute right-1 top-4 rounded-md border border-gray-200 bg-gray-300 px-2"
                              string={field.value}
                            />
                          </div>
                        }
                        field={{ ...field }}
                        helperMessage={t('galxe.form.evmAddressHelper')}
                        label={t('galxe.form.evmAddress')}
                      />
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="signature"
                    render={({ field }) => (
                      <TextField
                        classes={{
                          input: 'font-mono',
                        }}
                        endAdornment={
                          <div className="w-8">
                            <CopyToClipboardIcon
                              className="peer/adornment adornment absolute right-1 top-4 rounded-md border border-gray-200 bg-gray-300 px-2"
                              string={field.value}
                            />
                          </div>
                        }
                        field={{ ...field, readOnly: true }}
                        label={t('galxe.form.signature')}
                      />
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="combined"
                    render={({ field }) => (
                      <TextField
                        classes={{
                          input: 'font-mono',
                        }}
                        endAdornment={
                          <div className="w-8">
                            <CopyToClipboardIcon
                              className="peer/adornment adornment absolute right-1 top-4 rounded-md border border-gray-200 bg-gray-300 px-2"
                              string={field.value}
                            />
                          </div>
                        }
                        field={{ ...field, readOnly: true }}
                        label={t('galxe.form.proof')}
                      />
                    )}
                  />

                  <Button className="w-full" disabled={isPending} type="submit">
                    {isPending && <Loader2 className="animate-spin" />}
                    <span className="ml-2">
                      {t('galxe.form.registerInstallation')}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </SubpageLayout>
  );
};
