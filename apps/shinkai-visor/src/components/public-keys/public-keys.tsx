import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  PublicKeysFormSchema,
  publicKeysSchema,
} from '@shinkai_network/shinkai-node-state/forms/settings/public-keys';
import {
  CopyToClipboardIcon,
  Form,
  FormField,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { useForm } from 'react-hook-form';

import { useAuth } from '../../store/auth/auth';

export const PublicKeys = () => {
  const { t } = useTranslation();

  const auth = useAuth((state) => state.auth);
  const form = useForm<PublicKeysFormSchema>({
    resolver: zodResolver(publicKeysSchema),
    defaultValues: {
      node_encryption_pk: auth?.node_encryption_pk,
      node_signature_pk: auth?.node_signature_pk,
      profile_encryption_pk: auth?.profile_encryption_pk,
      profile_identity_pk: auth?.profile_identity_pk,
      my_device_encryption_pk: auth?.my_device_encryption_pk,
      my_device_identity_pk: auth?.my_device_identity_pk,
    },
  });

  return (
    <div className="flex flex-col space-y-8 pr-2.5">
      <div className="flex grow flex-col space-y-2">
        <Form {...form}>
          <form className="flex flex-col justify-between space-y-8">
            <div className="flex grow flex-col space-y-5">
              <div>
                <h2 className="text-gray-80 mb-2 text-sm">
                  {t('settings.publicKeys.nodePublicKeys')}
                </h2>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="node_encryption_pk"
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
                        label={t('settings.publicKeys.nodeEncryption')}
                      />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="node_signature_pk"
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
                        label={t('settings.publicKeys.nodeSignature')}
                      />
                    )}
                  />
                </div>
              </div>
              <div>
                <h2 className="text-gray-80 mb-2 text-sm">
                  {t('settings.publicKeys.profilePublicKeys')}
                </h2>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="profile_encryption_pk"
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
                        label={t('settings.publicKeys.profileEncryption')}
                      />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="profile_identity_pk"
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
                        label={t('settings.publicKeys.profileIdentity')}
                      />
                    )}
                  />
                </div>
              </div>
              <div>
                <h2 className="text-gray-80 mb-2 text-sm">
                  {t('settings.publicKeys.myDevicePublicKeys')}
                </h2>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="my_device_encryption_pk"
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
                        label={t('settings.publicKeys.myDeviceEncryption')}
                      />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="my_device_identity_pk"
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
                        label={t('settings.publicKeys.myDeviceIdentity')}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
