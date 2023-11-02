import { zodResolver } from '@hookform/resolvers/zod';
import { Player } from '@lottiefiles/react-lottie-player';
import { QRSetupData } from '@shinkai_network/shinkai-message-ts/models';
import {
  generateEncryptionKeys,
  generateSignatureKeys,
} from '@shinkai_network/shinkai-message-ts/utils';
import { useSubmitRegistrationNoCode } from '@shinkai_network/shinkai-node-state/lib/mutations/submitRegistation/useSubmitRegistrationNoCode';
import { BrowserQRCodeReader } from '@zxing/browser';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import * as z from 'zod';

import ScanQrAnimation from '../../assets/animations/scan-qr.json';
import { SetupData, useAuth } from '../../store/auth/auth';
import { Button } from '../ui/button';
import ErrorMessage from '../ui/error-message';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';

const formSchema = z.object({
  registrationCode: z.string().optional(),
  registrationName: z.string().nonempty(),
  permissionType: z.enum(['admin']),
  identityType: z.enum(['device']),
  profile: z.enum(['main']),
  nodeAddress: z.string().url(),
  shinkaiIdentity: z.string().nonempty(),
  nodeEncryptionPublicKey: z.string().optional(),
  nodeSignaturePublicKey: z.string().optional(),
  profileEncryptionPublicKey: z.string().nonempty(),
  profileSignaturePublicKey: z.string().nonempty(),
  myDeviceEncryptionPublicKey: z.string().nonempty(),
  myDeviceIdentityPublicKey: z.string().nonempty(),
  profileEncryptionSharedKey: z.string().nonempty(),
  profileSignatureSharedKey: z.string().nonempty(),
  myDeviceEncryptionSharedKey: z.string().nonempty(),
  myDeviceIdentitySharedKey: z.string().nonempty(),
});

type FormType = z.infer<typeof formSchema>;

type AddNodeDataFromQr = Pick<
  FormType,
  | 'registrationCode'
  | 'nodeAddress'
  | 'shinkaiIdentity'
  | 'nodeEncryptionPublicKey'
  | 'nodeSignaturePublicKey'
>;

enum AddNodeSteps {
  ScanQR = 0,
  Connect,
}

export const AddNode = () => {
  const history = useHistory();
  const setAuth = useAuth((state) => state.setAuth);
  const DEFAULT_NODE_ADDRESS = 'http://127.0.0.1:9550';
  // TODO: This value should be obtained from node
  const DEFAULT_SHINKAI_IDENTITY = '@@localhost.shinkai';
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      registrationCode: '',
      registrationName: 'main_device',
      permissionType: 'admin',
      identityType: 'device',
      profile: 'main',
      nodeAddress: '',
      shinkaiIdentity: '',
      nodeEncryptionPublicKey: '',
      nodeSignaturePublicKey: '',
      profileEncryptionPublicKey: '',
      profileSignaturePublicKey: '',
      myDeviceEncryptionPublicKey: '',
      myDeviceIdentityPublicKey: '',
      profileEncryptionSharedKey: '',
      profileSignatureSharedKey: '',
      myDeviceEncryptionSharedKey: '',
      myDeviceIdentitySharedKey: undefined,
    },
  });
  const {
    isLoading,
    mutateAsync: submitRegistration,
    isError: isSubmitError,
    error: submitError,
  } = useSubmitRegistrationNoCode({
    onSuccess: (response) => {
      if (response.success) {
        const values = form.getValues();
        const authData = {
          profile: values.profile,
          permission_type: values.permissionType,
          node_address: values.nodeAddress,
          shinkai_identity: values.shinkaiIdentity,
          node_signature_pk:
            response.data?.identity_public_key ??
            values.nodeSignaturePublicKey ??
            '',
          node_encryption_pk:
            response.data?.encryption_public_key ??
            values.nodeEncryptionPublicKey ??
            '',
          registration_name: values.registrationName,
          my_device_identity_pk: values.myDeviceIdentityPublicKey,
          my_device_identity_sk: values.myDeviceIdentitySharedKey,
          my_device_encryption_pk: values.myDeviceEncryptionPublicKey,
          my_device_encryption_sk: values.myDeviceEncryptionSharedKey,
          profile_identity_pk: values.profileSignaturePublicKey,
          profile_identity_sk: values.profileSignatureSharedKey,
          profile_encryption_pk: values.profileEncryptionPublicKey,
          profile_encryption_sk: values.profileEncryptionSharedKey,
        }
        authSuccess(authData);
      } else {
        throw new Error('Failed to submit registration');
      }
    },
  });

  const fileInput = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState<AddNodeSteps>(
    AddNodeSteps.ScanQR
  );

  const onFileInputClick = () => {
    fileInput.current?.click();
  };

  const onQrImageSelected: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ): Promise<void> => {
    if (!event.target.files || !event.target.files[0]) {
      return;
    }
    const qrImageUrl = URL.createObjectURL(event.target.files[0]);
    const codeReader = new BrowserQRCodeReader();
    const resultImage = await codeReader.decodeFromImageUrl(qrImageUrl);
    const jsonString = resultImage.getText();
    const parsedQrData: QRSetupData = JSON.parse(jsonString);
    const nodeDataFromQr = getValuesFromQr(parsedQrData);
    form.reset((prev) => ({ ...prev, ...nodeDataFromQr }));
    setCurrentStep(AddNodeSteps.Connect);
  };

  const generateDeviceEncryptionKeys = async (): Promise<
    Pick<
      FormType,
      'myDeviceEncryptionPublicKey' | 'myDeviceEncryptionSharedKey'
    >
  > => {
    const seed = crypto.getRandomValues(new Uint8Array(32));
    const { my_encryption_pk_string, my_encryption_sk_string } =
      await generateEncryptionKeys(seed);
    return {
      myDeviceEncryptionPublicKey: my_encryption_pk_string,
      myDeviceEncryptionSharedKey: my_encryption_sk_string,
    };
  };

  const generateDeviceSignatureKeys = async (): Promise<
    Pick<FormType, 'myDeviceIdentityPublicKey' | 'myDeviceIdentitySharedKey'>
  > => {
    const { my_identity_pk_string, my_identity_sk_string } =
      await generateSignatureKeys();
    return {
      myDeviceIdentityPublicKey: my_identity_pk_string,
      myDeviceIdentitySharedKey: my_identity_sk_string,
    };
  };

  const generateProfileEncryptionKeys = async (): Promise<
    Pick<FormType, 'profileEncryptionPublicKey' | 'profileEncryptionSharedKey'>
  > => {
    const seed = crypto.getRandomValues(new Uint8Array(32));
    const { my_encryption_pk_string, my_encryption_sk_string } =
      await generateEncryptionKeys(seed);
    return {
      profileEncryptionPublicKey: my_encryption_pk_string,
      profileEncryptionSharedKey: my_encryption_sk_string,
    };
  };

  const generateProfileSignatureKeys = async (): Promise<
    Pick<FormType, 'profileSignaturePublicKey' | 'profileSignatureSharedKey'>
  > => {
    const { my_identity_pk_string, my_identity_sk_string } =
      await generateSignatureKeys();
    return {
      profileSignaturePublicKey: my_identity_pk_string,
      profileSignatureSharedKey: my_identity_sk_string,
    };
  };

  const getValuesFromQr = (qrData: QRSetupData): AddNodeDataFromQr => {
    return {
      registrationCode: qrData.registration_code,
      nodeAddress: qrData.node_address,
      shinkaiIdentity: qrData.shinkai_identity,
      nodeEncryptionPublicKey: qrData.node_encryption_pk,
      nodeSignaturePublicKey: qrData.node_signature_pk,
    };
  };

  const connect = (values: FormType) => {
    submitRegistration({
      registration_code: values.registrationCode ?? '',
      profile: values.profile,
      identity_type: values.identityType,
      permission_type: values.permissionType,
      node_address: values.nodeAddress,
      shinkai_identity: values.shinkaiIdentity,
      node_encryption_pk: values.nodeEncryptionPublicKey ?? '',
      registration_name: values.registrationName,
      my_device_identity_sk: values.myDeviceIdentitySharedKey,
      my_device_encryption_sk: values.myDeviceEncryptionSharedKey,
      profile_identity_sk: values.profileSignatureSharedKey,
      profile_encryption_sk: values.profileEncryptionSharedKey,
    });
  };

  const authSuccess = (setupData: SetupData) => {
    setAuth(setupData);
    history.replace('/inboxes');
  }

  useEffect(() => {
    Promise.all([
      generateDeviceEncryptionKeys(),
      generateDeviceSignatureKeys(),
      generateProfileEncryptionKeys(),
      generateProfileSignatureKeys(),
    ]).then(
      ([
        deviceEncryption,
        deviceSignature,
        profileEncryption,
        profileSignature,
      ]) => {
        form.reset((prevInitialValues) => ({
          ...prevInitialValues,
          ...deviceEncryption,
          ...deviceSignature,
          ...profileEncryption,
          ...profileSignature,
        }));
      }
    );
  }, [form]);

  useEffect(() => {
    fetch(`${DEFAULT_NODE_ADDRESS}/v1/shinkai_health`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'ok') {
          form.setValue('nodeAddress', DEFAULT_NODE_ADDRESS);
          form.setValue('shinkaiIdentity', DEFAULT_SHINKAI_IDENTITY);
          setCurrentStep(AddNodeSteps.Connect);
        }
      })
      .catch((error) => console.error('error polling', error));
  }, [form]);

  return (
    <div className="h-full flex flex-col space-y-3">
      <span className="text-xl">Connect</span>
      <div className="h-full flex flex-col grow place-content-center">
        {currentStep === AddNodeSteps.ScanQR && (
          <div className="h-full flex flex-col space-y-3 justify-between">
            <div className="grow flex flex-col justify-center">
              <Player
                autoplay
                className="w-40"
                loop
                src={ScanQrAnimation}
              ></Player>
            </div>

            <div className="flex flex-col space-y-1">
              <Button className="w-full" onClick={onFileInputClick}>
                <span>
                  <FormattedMessage id="upload-qr-code" />
                </span>
              </Button>
              <input
                accept="image/png, image/jpeg"
                alt="shinaki node qr code input"
                className="hidden"
                onChange={(event) => onQrImageSelected(event)}
                ref={fileInput}
                type="file"
              />
            </div>
          </div>
        )}

        {currentStep === AddNodeSteps.Connect && (
          <Form {...form}>
            <form
              className="h-full flex flex-col space-y-2 justify-between"
              onSubmit={form.handleSubmit(connect)}
            >
              <div className="grow flex flex-col space-y-3">
                <FormField
                  control={form.control}
                  name="registrationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <FormattedMessage id="registration-name" />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nodeAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <FormattedMessage id="node-address" />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isSubmitError && (
                  <ErrorMessage message={submitError?.message} />
                )}
              </div>

              <Button className="w-full" disabled={isLoading} type="submit">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <FormattedMessage id="connect" />
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};
