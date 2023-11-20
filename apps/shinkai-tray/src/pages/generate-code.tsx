import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { DownloadIcon } from "@radix-ui/react-icons";
import { save } from "@tauri-apps/api/dialog";
import { BaseDirectory, writeBinaryFile } from "@tauri-apps/api/fs";
import { Check } from "lucide-react";
import { z } from "zod";

import { useCreateRegistrationCode } from "../api/mutations/createRegistrationCode/useCreateRegistrationCode.ts";
import { Button } from "../components/ui/button.tsx";
import { Dialog, DialogContent } from "../components/ui/dialog.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form.tsx";
import { Input } from "../components/ui/input.tsx";
import QRCode from "../components/ui/qr-code.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select.tsx";
import { SetupData, useAuth } from "../store/auth.ts";
import SimpleLayout from "./layout/simple-layout.tsx";

const saveImage = async (dataUrl: string) => {
  const suggestedFilename = "registration-code-shinkai.png";
  await save({ defaultPath: BaseDirectory.Download + "/" + suggestedFilename });
  await writeBinaryFile(
    suggestedFilename,
    await fetch(dataUrl).then((response) => response.arrayBuffer()),
    { dir: BaseDirectory.Download }
  );
};

enum IdentityType {
  Profile = "profile",
  Device = "device",
}

enum PermissionType {
  Admin = "admin",
  Standard = "standard",
  None = "none",
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

type GeneratedSetupData = Partial<
  SetupData & { registration_code: string; identity_type: string }
>;
const GenerateCodePage = () => {
  const auth = useAuth((state) => state.auth);
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const [generatedSetupData, setGeneratedSetupData] = useState<
    GeneratedSetupData | undefined
  >();

  const form = useForm<z.infer<typeof generateCodeSchema>>({
    resolver: zodResolver(generateCodeSchema),
    defaultValues: {
      profile: "",
      permissionType: PermissionType.Admin,
      identityType: IdentityType.Device,
    },
  });

  const { mutateAsync: createRegistrationCode, isPending } = useCreateRegistrationCode({
    onSuccess: (registrationCode) => {
      const formValues = form.getValues();
      const setupData: GeneratedSetupData = {
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
      setQrCodeModalOpen(true);
    },
  });

  const { identityType } = form.watch();

  const onSubmit = async (data: z.infer<typeof generateCodeSchema>) => {
    await createRegistrationCode({
      permissionsType: data.permissionType,
      identityType: data.identityType,
      setupPayload: {
        my_device_encryption_sk: auth?.my_device_encryption_sk ?? "",
        my_device_identity_sk: auth?.my_device_identity_sk ?? "",
        profile_encryption_sk: auth?.profile_encryption_sk ?? "",
        profile_identity_sk: auth?.profile_identity_sk ?? "",
        node_encryption_pk: auth?.node_encryption_pk ?? "",
        permission_type: auth?.permission_type ?? "",
        registration_name: auth?.registration_name ?? "",
        profile: auth?.profile ?? "",
        shinkai_identity: auth?.shinkai_identity ?? "",
        node_address: auth?.node_address ?? "",
        //TODO: remove from network lib these unused params
        registration_code: "",
        identity_type: "",
      },
      profileName: data.profile,
    });
  };
  return (
    <SimpleLayout title="Generate Registration Code">
      <Form {...form}>
        <form
          className="flex flex-col justify-between space-y-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex grow flex-col space-y-2">
            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Identity Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your AI Agent" />
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
              control={form.control}
              name="identityType"
            />

            {identityType === IdentityType.Device && (
              <FormField
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                control={form.control}
                name="profile"
              />
            )}

            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Permission Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your AI Agent" />
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
              control={form.control}
              name="permissionType"
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
        generatedSetupData={generatedSetupData}
        onOpenChange={setQrCodeModalOpen}
        open={qrCodeModalOpen}
      />
    </SimpleLayout>
  );
};

export default GenerateCodePage;

function QrCodeModal({
  open,
  onOpenChange,
  generatedSetupData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generatedSetupData: GeneratedSetupData | undefined;
}) {
  const [saved, setSaved] = useState(false);
  const downloadCode = async () => {
    const canvas = document.querySelector("#registration-code-qr");
    if (canvas instanceof HTMLCanvasElement) {
      /*
       Tauri has this feature in the roadmap, but it's not available yet.
       https://github.com/tauri-apps/tauri/issues/4633
       const downloadLink = document.createElement("a");
       downloadLink.href = pngUrl;
       downloadLink.download = `registration-code-shinkai.png`;
       document.body.append(downloadLink);
       console.log(downloadLink);
       downloadLink.click();
       downloadLink.remove();
     */
      try {
        const pngUrl = canvas.toDataURL();
        await saveImage(pngUrl);
        setSaved(true);
      } catch (error) {
        console.error(error);
      } finally {
        setTimeout(() => {
          setSaved(false);
        }, 3000);
      }
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <div className="flex flex-col items-center py-4">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          <h2 className="mb-1 text-lg font-semibold">Here's your QR Code</h2>
          <p className="mb-5 text-center text-xs text-foreground">
            Scan the QR code with your Shinkai app or download it to register your device.
          </p>
          <div className="mb-7 overflow-hidden rounded-lg shadow-2xl">
            <QRCode
              id="registration-code-qr"
              size={190}
              value={JSON.stringify(generatedSetupData)}
            />
          </div>
          <div className="flex gap-4">
            <Button className="flex gap-1" onClick={downloadCode}>
              {saved ? <Check /> : <DownloadIcon className="h-4 w-4" />}
              {saved ? "Saved" : "Download"}
            </Button>
            <Button
              onClick={() => {
                onOpenChange(false);
              }}
              className="flex gap-1"
              variant="ghost"
            >
              I saved it, close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
