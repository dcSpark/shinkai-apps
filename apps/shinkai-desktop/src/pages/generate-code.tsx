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
import { save } from '@tauri-apps/api/dialog';
import { BaseDirectory, writeBinaryFile } from '@tauri-apps/api/fs';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useAuth } from '../store/auth';
import { SubpageLayout } from './layout/simple-layout';

const saveImage = async (dataUrl: string) => {
  const suggestedFilename = 'registration-code-shinkai.png';
  const filePath = await save({
    defaultPath: BaseDirectory.Download + '/' + suggestedFilename,
  });
  const buffer = await (await fetch(dataUrl)).arrayBuffer();
  if (filePath) {
    await writeBinaryFile(filePath, buffer);
  }
};

enum IdentityType {
  Profile = 'profile',
  Device = 'device',
}

enum PermissionType {
  Admin = 'admin',
  Standard = 'standard',
  None = 'none',
}

const generateCodeSchema = z.object({
  identityType: z.nativeEnum(IdentityType),
  profile: z.string(),
  permissionType: z.nativeEnum(PermissionType),
});

const identityTypeOptions = [IdentityType.Profile, IdentityType.Device];
const permissionOptions = [
  PermissionType.Admin,
  PermissionType.Standard,
  PermissionType.None,
];

const GenerateCodePage = () => {
  const auth = useAuth((state) => state.auth);
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const [generatedSetupData, setGeneratedSetupData] = useState<
    QRSetupData | undefined
  >();

  const form = useForm<z.infer<typeof generateCodeSchema>>({
    resolver: zodResolver(generateCodeSchema),
    defaultValues: {
      profile: auth?.profile,
      permissionType: PermissionType.Admin,
      identityType: IdentityType.Device,
    },
  });

  const { mutateAsync: createRegistrationCode, isPending } =
    useCreateRegistrationCode({
      onSuccess: (registrationCode) => {
        const formValues = form.getValues();
        const setupData: QRSetupData = {
          registration_code: registrationCode,
          permission_type: formValues.permissionType,
          identity_type: formValues.identityType,
          profile: formValues.profile,
          node_address: auth?.node_address ?? '',
          shinkai_identity: auth?.shinkai_identity ?? '',
          node_encryption_pk: auth?.node_encryption_pk ?? '',
          node_signature_pk: auth?.node_signature_pk ?? '',
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
        setQrCodeModalOpen(true);
      },
    });

  const { identityType } = form.watch();

  const onSubmit = async (data: z.infer<typeof generateCodeSchema>) => {
    await createRegistrationCode({
      nodeAddress: auth?.node_address ?? '',
      permissionsType: data.permissionType,
      identityType: data.identityType,
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
        //TODO: remove from network components these unused params
        registration_code: '',
        identity_type: '',
      },
      profileName: data.profile,
    });
  };
  useEffect(() => {
    if (form.getValues().profile) {
      return;
    }
    form.setValue('profile', auth?.profile ?? '');
  }, [auth, form]);
  return (
    <SubpageLayout title="Generate Registration Code">
      <Form {...form}>
        <form
          className="flex flex-col justify-between space-y-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex grow flex-col space-y-2">
            {/* TODO: Re enable identity type selector later, Profiles probably won't be relevant to any frontend experiences for the next 6+ months @Rob */}
            {false && (
              <FormField
                control={form.control}
                name="identityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Identity Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your AI" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {identityTypeOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            <span>{option} </span>
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
                disabled={true}
                name="profile"
                render={({ field }) => (
                  <TextField field={field} label="Profile" />
                )}
              />
            )}

            <FormField
              control={form.control}
              name="permissionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Permission Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your AI" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {permissionOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          <span>{option} </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                    <FormMessage />
                  </Select>
                </FormItem>
              )}
            />
          </div>
          <Button
            className="w-full"
            disabled={isPending}
            isLoading={isPending}
            type="submit"
          >
            Generate Code
          </Button>
        </form>
      </Form>
      <QrCodeModal
        description="Scan the QR code with your Shinkai app or download it to register"
        modalClassName={'w-[85%]'}
        onOpenChange={setQrCodeModalOpen}
        onSave={(dataUrl) => saveImage(dataUrl)}
        open={qrCodeModalOpen}
        title="Here's your QR Code"
        value={JSON.stringify(generatedSetupData)}
      />
    </SubpageLayout>
  );
};

export default GenerateCodePage;
