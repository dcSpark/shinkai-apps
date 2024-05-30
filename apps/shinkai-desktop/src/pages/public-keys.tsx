import { zodResolver } from '@hookform/resolvers/zod';
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

import { useAuth } from '../store/auth';
import { SubpageLayout } from './layout/simple-layout';

export const PublicKeys = () => {
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
    <SubpageLayout title="Public Keys">
      <div className="flex grow flex-col space-y-2">
        <Form {...form}>
          <form className="flex flex-col justify-between space-y-8">
            <div className="flex grow flex-col space-y-5">
              <div>
                <h2 className="text-gray-80 mb-2 text-sm">Node Public Keys</h2>
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
                        label="Node Encryption"
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
                        label="Node Signature"
                      />
                    )}
                  />
                </div>
              </div>
              <div>
                <h2 className="text-gray-80 mb-2 text-sm">
                  Profile Public Keys
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
                        label="Profile Encryption"
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
                        label="Profile Identity"
                      />
                    )}
                  />
                </div>
              </div>
              <div>
                <h2 className="text-gray-80 mb-2 text-sm">
                  My Device Public Keys
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
                        label="My Device Encryption"
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
                        label="My Device Identity"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </SubpageLayout>
  );
};
