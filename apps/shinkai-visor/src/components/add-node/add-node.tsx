import { zodResolver } from '@hookform/resolvers/zod';
import { Player } from '@lottiefiles/react-lottie-player';
import { QRSetupData } from '@shinkai_network/shinkai-message-ts/models';
import {
  generateEncryptionKeys,
  generateSignatureKeys,
} from '@shinkai_network/shinkai-message-ts/utils';
import { BrowserQRCodeReader } from '@zxing/browser';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import * as z from 'zod';

import ScanQrAnimation from '../../assets/animations/scan-qr.json';
import { RootState, useTypedDispatch } from '../../store';
import { connectNode } from '../../store/node/node-actions';
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

const formSchema = z.object({
  registrationCode: z.string().nonempty(),
  registrationName: z.string().nonempty(),
  permissionType: z.enum(['admin']),
  identityType: z.enum(['device']),
  profile: z.enum(['main']),
  nodeAddress: z.string().url(),
  shinkaiIdentity: z.string().nonempty(),
  nodeEncryptionPublicKey: z.string().nonempty(),
  nodeSignaturePublicKey: z.string().nonempty(),
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
  const form = useForm<z.infer<typeof formSchema>>({
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
  const fileInput = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState<AddNodeSteps>(
    AddNodeSteps.ScanQR,
  );
  // const currentFormValue = Form.useWatch([], form);
  const isConnecting = useSelector(
    (state: RootState) => state?.node?.status === 'loading',
  );
  const dispatch = useTypedDispatch();

  const onFileInputClick = () => {
    fileInput.current?.click();
  };

  const onQrImageSelected: React.ChangeEventHandler<HTMLInputElement> = async (
    event,
  ): Promise<void> => {
    if (!event.target.files || !event.target.files[0]) {
      return;
    }
    const qrImageUrl = URL.createObjectURL(event.target.files[0]);
    const codeReader = new BrowserQRCodeReader();
    const resultImage = await codeReader.decodeFromImageUrl(qrImageUrl);
    const json_string = resultImage.getText();
    const parsedQrData: QRSetupData = JSON.parse(json_string);
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

  const connectManually = () => {
    setCurrentStep(AddNodeSteps.Connect);
  };

  const scanQr = () => {
    form.reset();
    setCurrentStep(AddNodeSteps.ScanQR);
  };

  const connect = (values: z.infer<typeof formSchema>) => {
    setCurrentStep(AddNodeSteps.Connect);
    dispatch(
      connectNode({
        nodeData: {
          registrationCode: values.registrationCode,
          profile: values.profile,
          identityType: values.identityType,
          permissionType: values.permissionType,
          nodeAddress: values.nodeAddress,
          shinkaiIdentity: values.shinkaiIdentity,
          nodeEncryptionPublicKey: values.nodeEncryptionPublicKey,
          nodeSignaturePublicKey: values.nodeSignaturePublicKey,
        },
        userData: {
          registrationName: values.registrationName,
        },
        credentials: {
          myDeviceIdentityPublicKey: values.myDeviceEncryptionPublicKey,
          myDeviceIdentitySharedKey: values.myDeviceEncryptionSharedKey,

          myDeviceEncryptionPublicKey: values.myDeviceIdentityPublicKey,
          myDeviceEncryptionSharedKey: values.myDeviceEncryptionSharedKey,

          profileSignaturePublicKey: values.profileSignaturePublicKey,
          profileSignatureSharedKey: values.profileSignatureSharedKey,

          profileEncryptionPublicKey: values.profileEncryptionPublicKey,
          profileEncryptionSharedKey: values.profileEncryptionSharedKey,
        },
      }),
    )
      .unwrap()
      .then(() => {
        history.replace('/inboxes');
      })
      .catch((e) => {
        console.log(e);
      });
  };

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
      },
    );
  }, [form]);

  return (
    <div className="h-full flex flex-col space-y-3">
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
              <div className="grow flex flex-col space-y-2">
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
              </div>
              <Button
                className="w-full"
                disabled={!form.formState.isValid || isConnecting}
                type="submit"
              >
                {isConnecting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <FormattedMessage id="connect" />
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};
