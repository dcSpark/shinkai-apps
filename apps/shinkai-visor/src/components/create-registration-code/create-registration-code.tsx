import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateRegistrationCode } from '@shinkai_network/shinkai-node-state/lib/mutations/createRegistrationCode/useCreateRegistrationCode';
import { Download, Loader2, QrCode } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { z } from 'zod';

import shinkaiLogo from '../../assets/icons/shinkai-min.svg';
import { SetupData, useAuth } from '../../store/auth/auth';
import { Header } from '../header/header';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

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
  const canvasContainer = useRef<HTMLDivElement>(null);
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profile: '',
      permissionType: PermissionType.Admin,
      identityType: IdentityType.Device,
    },
  });
  const identityType = useWatch({
    name: 'identityType',
    control: form.control,
  });
  const [generatedSetupData, setGeneratedSetupData] = useState<
    | Partial<SetupData & { registration_code: string; identity_type: string }>
    | undefined
  >();
  const { mutateAsync: createRegistrationCode, isPending } =
    useCreateRegistrationCode({
      onSuccess: (registrationCode) => {
        const formValues = form.getValues();
        const setupData: Partial<
          SetupData & { registration_code: string; identity_type: string }
        > = {
          registration_code: registrationCode,
          permission_type: formValues.permissionType,
          identity_type: formValues.identityType,
          profile: formValues.profile,
          node_address: auth?.node_address,
          shinkai_identity: auth?.shinkai_identity,
          node_encryption_pk: auth?.node_encryption_pk,
          node_signature_pk: auth?.node_signature_pk,
          ...(formValues.identityType === IdentityType.Device &&
          formValues.profile === auth?.profile
            ? {
                profile_encryption_pk: auth.profile_encryption_pk,
                profile_encryption_sk: auth.profile_encryption_sk,
                profile_identity_pk: auth.profile_identity_pk,
                profile_identity_sk: auth.profile_identity_sk,
              }
            : {}),
        };
        setGeneratedSetupData(setupData);
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
    createRegistrationCode({
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
      } as any,
      profileName: values.profile,
    });
  };
  const download = (): void => {
    const canvas =
      canvasContainer?.current?.getElementsByTagName('canvas')?.[1];
    if (!canvas) {
      return;
    }
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
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
    <div className="h-full flex flex-col space-y-3">
      <Header
        icon={<QrCode />}
        title={
          <FormattedMessage id="create-registration-code"></FormattedMessage>
        }
      />
      <div className="grow flex flex-col space-y-2">
        <Form {...form}>
          <form
            className="flex flex-col space-y-3 justify-between"
            onSubmit={form.handleSubmit(submit)}
          >
            <div className="grow flex flex-col space-y-2">
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
                      <SelectPortal>
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
                      </SelectPortal>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {identityType === IdentityType.Device && (
                <FormField
                  control={form.control}
                  name="profile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <FormattedMessage id="profile.one" />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
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
                      <SelectPortal>
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
                      </SelectPortal>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button className="w-full" type="submit">
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <QrCode className="mr-2 h-4 w-4" />
              )}
              <FormattedMessage id="generate-registration-code" />
            </Button>
          </form>
        </Form>

        {generatedSetupData && (
          <div className=" grow flex flex-col items-center justify-center space-y-3">
            <div className="flex flex-col space-y-1">
              <span className="font-semibold">
                <FormattedMessage id="scan-or-download-registration-code" />
              </span>
              <span>
                <FormattedMessage id="use-it-to-register-and-connect" />
              </span>
            </div>
            <div className="w-full flex flex-row justify-center items-center">
              <div
                className="relative flex flex-col group"
                ref={canvasContainer}
              >
                <QRCodeCanvas
                  imageSettings={{
                    src: shinkaiLogo,
                    excavate: true,
                    height: 24,
                    width: 24,
                  }}
                  level="H"
                  size={128}
                  value={JSON.stringify(generatedSetupData)}
                />
                <QRCodeCanvas
                  className="hidden"
                  imageSettings={{
                    src: shinkaiLogo,
                    excavate: true,
                    height: 24,
                    width: 24,
                  }}
                  level="H"
                  size={512}
                  value={JSON.stringify(generatedSetupData)}
                />
                <Button
                  className="absolute bottom-1 right-1 invisible group-hover:visible"
                  onClick={() => download()}
                  size="icon"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
