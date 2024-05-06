import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, TextField } from '@shinkai_network/shinkai-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useAuth } from '../store/auth';
import { SubpageLayout } from './layout/simple-layout';

export const PublicKeys = () => {
  const formSchema = z.object({
    node_encryption_pk: z.string().optional(),
    node_signature_pk: z.string().optional(),
    profile_encryption_pk: z.string().optional(),
    profile_identity_pk: z.string().optional(),
    my_device_encryption_pk: z.string().optional(),
    my_device_identity_pk: z.string().optional(),
  });
  type FormSchemaType = z.infer<typeof formSchema>;
  const auth = useAuth((state) => state.auth);
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
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
              <FormField
                control={form.control}
                name="node_encryption_pk"
                render={({ field }) => (
                  <TextField
                    field={{ ...field, readOnly: true }}
                    label="Node Encryption Public Key"
                  />
                )}
              />
              <FormField
                control={form.control}
                name="node_signature_pk"
                render={({ field }) => (
                  <TextField
                    field={{ ...field, readOnly: true }}
                    label="Node Signature Public Key"
                  />
                )}
              />
              <FormField
                control={form.control}
                name="profile_encryption_pk"
                render={({ field }) => (
                  <TextField
                    field={{ ...field, readOnly: true }}
                    label="Profile Encryption Public Key"
                  />
                )}
              />
              <FormField
                control={form.control}
                name="profile_identity_pk"
                render={({ field }) => (
                  <TextField
                    field={{ ...field, readOnly: true }}
                    label="Profile Identity Public Key"
                  />
                )}
              />
              <FormField
                control={form.control}
                name="my_device_encryption_pk"
                render={({ field }) => (
                  <TextField
                    field={{ ...field, readOnly: true }}
                    label="My Device Encryption Public Key"
                  />
                )}
              />
              <FormField
                control={form.control}
                name="my_device_identity_pk"
                render={({ field }) => (
                  <TextField
                    field={{ ...field, readOnly: true }}
                    label="My Device Identity Public Key"
                  />
                )}
              />
            </div>
          </form>
        </Form>
      </div>
    </SubpageLayout>
  );
};
