import { zodResolver } from '@hookform/resolvers/zod';
import { QRSetupData } from '@shinkai_network/shinkai-message-ts/models';
import { useCreateRegistrationCode } from '@shinkai_network/shinkai-node-state/lib/mutations/createRegistrationCode/useCreateRegistrationCode';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  QrCodeModal,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { z } from 'zod';

import { useAuth } from '../../store/auth/auth';
import { Header } from '../header/header';

enum IdentityType {
  Profile = 'profile',
  Device = 'device',
}

enum PermissionType {
  Admin = 'admin',
  Standard = 'standard',
  None = 'none',
}

const formSchema = z.object({
  identityType: z.nativeEnum(IdentityType),
  profile: z.string().min(1),
  permissionType: z.nativeEnum(PermissionType),
});

export const CreateRegistrationCode = () => {
  const intl = useIntl();
  type FormSchemaType = z.infer<typeof formSchema>;
  const auth = useAuth((state) => state.auth);
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profile: auth?.profile,
      permissionType: PermissionType.Admin,
      identityType: IdentityType.Device,
    },
  });
  const identityType = useWatch({
    name: 'identityType',
    control: form.control,
  });
  const [generatedSetupData, setGeneratedSetupData] = useState<
    QRSetupData | undefined
  >();
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);

  const { mutateAsync: createRegistrationCode, isPending } =
    useCreateRegistrationCode({
      onSuccess: (registrationCode) => {
        const formValues = form.getValues();
        setGeneratedSetupData({
          registration_code: registrationCode,
          profile: formValues.profile,
          identity_type: formValues.identityType,
          permission_type: formValues.permissionType,
          node_address: auth?.node_address ?? '',
          shinkai_identity: auth?.shinkai_identity ?? '',
          node_encryption_pk: auth?.node_encryption_pk ?? '',
          node_signature_pk: auth?.node_signature_pk ?? '',
          ...(formValues.identityType === IdentityType.Device && {
            profile_encryption_sk: auth?.profile_encryption_sk,
            profile_encryption_pk: auth?.profile_encryption_pk,
            profile_identity_sk: auth?.profile_identity_sk,
            profile_identity_pk: auth?.profile_identity_pk,
          }),
        } as QRSetupData);
        setQrCodeModalOpen(true);
      },
    });
  const identityTypeOptions: { value: IdentityType; label: string }[] = [
    {
      label: intl.formatMessage({ id: 'profile.one' }),
      value: IdentityType.Profile,
    },
    {
      label: intl.formatMessage({ id: 'device.one' }),
      value: IdentityType.Device,
    },
  ];
  const permissionOptions: { value: PermissionType; label: string }[] = [
    {
      label: intl.formatMessage({ id: 'admin' }),
      value: PermissionType.Admin,
    },
    {
      label: intl.formatMessage({ id: 'standard' }),
      value: PermissionType.Standard,
    },
    {
      label: intl.formatMessage({ id: 'none' }),
      value: PermissionType.None,
    },
  ];
  const submit = async (values: FormSchemaType): Promise<void> => {
    await createRegistrationCode({
      nodeAddress: auth?.node_address ?? '',
      permissionsType: values.permissionType,
      identityType: values.identityType,
      setupPayload: {
        my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
        my_device_identity_sk: auth?.my_device_identity_sk ?? '',
        profile_encryption_sk: auth?.profile_encryption_sk ?? '',
        profile_identity_sk: auth?.profile_identity_sk ?? '',
        node_encryption_pk: auth?.node_encryption_pk ?? '',
        permission_type: auth?.permission_type ?? '',
        registration_name: auth?.registration_name ?? '',
        profile: auth?.profile ?? '',
        shinkai_identity: auth?.shinkai_identity ?? '',
        node_address: auth?.node_address ?? '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      profileName: values.profile,
    });
  };
  const download = (dataUrl: string): void => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'registration_code.shinkai.png';
    link.click();
    URL.revokeObjectURL(link.href);
  };
  useEffect(() => {
    if (form.getValues().profile) {
      return;
    }
    form.setValue('profile', auth?.profile ?? '');
  }, [auth, form]);
  useEffect(() => {
    if (form.getValues().profile !== auth?.profile) {
      form.setValue('profile', '');
    }
  }, [form, identityType, auth]);
  return (
    <div className="flex h-full flex-col space-y-8">
      <Header title={<FormattedMessage id="create-registration-code" />} />
      <div className="flex grow flex-col space-y-2">
        <Form {...form}>
          <form
            className="flex flex-col justify-between space-y-6"
            onSubmit={form.handleSubmit(submit)}
          >
            <div className="flex grow flex-col space-y-2">
              {/* TODO: Re enable identity type selector later, Profiles probably won't be relevant to any frontend experiences for the next 6+ months @Rob */}
              {false && (
                <FormField
                  control={form.control}
                  name="identityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <FormattedMessage id="identity-type" />
                      </FormLabel>
                      <Select
                        defaultValue={field.value}
                        name={field.name}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {identityTypeOptions?.map((identityTypeOption) => (
                            <SelectItem
                              key={identityTypeOption.value}
                              value={identityTypeOption.value}
                            >
                              {identityTypeOption.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {identityType === IdentityType.Device && (
                <FormField
                  control={form.control}
                  name="profile"
                  render={({ field }) => (
                    <TextField
                      field={{ ...field, readOnly: true }}
                      label={<FormattedMessage id="profile.one" />}
                    />
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="permissionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <FormattedMessage id="permission-type" />
                    </FormLabel>
                    <Select
                      defaultValue={field.value}
                      name={field.name}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {permissionOptions?.map((permissionTypeOption) => (
                          <SelectItem
                            key={permissionTypeOption.value}
                            value={permissionTypeOption.value}
                          >
                            {permissionTypeOption.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button className="w-full" isLoading={isPending} type="submit">
              <FormattedMessage id="generate-registration-code" />
            </Button>
          </form>
        </Form>

        <QrCodeModal
          description={<FormattedMessage id="use-it-to-register-and-connect" />}
          modalClassName={'w-[85%]'}
          onOpenChange={setQrCodeModalOpen}
          onSave={download}
          open={qrCodeModalOpen}
          title={<FormattedMessage id="scan-or-download-registration-code" />}
          value={JSON.stringify(generatedSetupData)}
        />
      </div>
    </div>
  );
};
