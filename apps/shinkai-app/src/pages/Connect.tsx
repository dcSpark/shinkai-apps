import './Connect.css';

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import {
  IonContent,
  IonIcon,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import { isPlatform } from '@ionic/react';
import { QRSetupData } from '@shinkai_network/shinkai-message-ts/models';
import {
  generateEncryptionKeys,
  generateSignatureKeys,
} from '@shinkai_network/shinkai-message-ts/utils';
import { queryClient } from '@shinkai_network/shinkai-node-state/lib/constants';
import { useSubmitRegistration } from '@shinkai_network/shinkai-node-state/lib/mutations/submitRegistation/useSubmitRegistration';
import { useSubmitRegistrationNoCode } from '@shinkai_network/shinkai-node-state/lib/mutations/submitRegistation/useSubmitRegistrationNoCode';
import { QrScanner, QrScannerProps } from '@yudiel/react-qr-scanner';
import { BrowserQRCodeReader } from '@zxing/browser';
import { checkmarkSharp, cloudUpload, scan } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../store/auth';
import { SetupDetailsState } from '../store/reducers/setupDetailsReducer';

export type MergedSetupType = SetupDetailsState & QRSetupData;

const Connect = () => {
  const history = useHistory();
  const setAuth = useAuth((state) => state.setAuth);
  const setLogout = useAuth((state) => state.setLogout);
  const [mode, setMode] = useState<'Automatic' | 'Manual'>('Automatic');
  const {
    isLoading: isSubmitRegistrationLoading,
    mutateAsync: submitRegistration,
    isError: isSubmitRegistrationError,
    error: submitRegistrationError,
  } = useSubmitRegistration({
    onSuccess: (response) => {
      if (!response) throw new Error('Failed to submit registration');
      setAuth(setupData);
      history.push('/home');
    },
    onError: (error) => {
      console.log('Error from submitRegistration', error);
      toast.error(error.message);
    },
  });

  const {
    isLoading: isSubmitRegistrationNoCodeLoading,
    mutateAsync: submitRegistrationNocode,
    isError: isSubmitRegistrationNoCodeError,
    error: submitRegistrationNoCodeError,
  } = useSubmitRegistrationNoCode({
    onSuccess: (response) => {
      if (!response.success) throw new Error('Failed to submit registration');
      const responseData = response.data;
      const updatedSetupData = {
        ...setupData,
        node_encryption_pk: responseData?.encryption_public_key ?? '',
        node_signature_pk: responseData?.identity_public_key ?? '',
      };
      setAuth(updatedSetupData);
      history.push('/home');
    },
    onError: (error) => {
      console.log('Error from submitRegistrationNocode', error);
      toast.error(error.message);
    },
  });

  const [setupData, setSetupData] = useState<MergedSetupType>({
    registration_code: '',
    profile: 'main',
    registration_name: 'main_device',
    identity_type: 'device',
    permission_type: 'admin',
    node_address: '',
    shinkai_identity: '@@node1.shinkai', // this should actually be read from ENV
    node_encryption_pk: '',
    node_signature_pk: '',
    profile_encryption_sk: '',
    profile_encryption_pk: '',
    profile_identity_sk: '',
    profile_identity_pk: '',
    my_device_encryption_sk: '',
    my_device_encryption_pk: '',
    my_device_identity_sk: '',
    my_device_identity_pk: '',
  });

  const isLoading =
    isSubmitRegistrationLoading || isSubmitRegistrationNoCodeLoading;

  const isError = isSubmitRegistrationError || isSubmitRegistrationNoCodeError;

  const error = submitRegistrationError || submitRegistrationNoCodeError;

  useEffect(() => {
    setLogout();
    queryClient.clear();

    fetch('http://127.0.0.1:9550/v1/shinkai_health')
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'ok') {
          updateSetupData({ node_address: 'http://127.0.0.1:9550' });
        }
      })
      .catch((error) => console.error('Error:', error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate keys when the component mounts
  useEffect(() => {
    // Assuming the seed is a random 32 bytes array.
    // Device Keys
    let seed = crypto.getRandomValues(new Uint8Array(32));
    generateEncryptionKeys(seed).then(
      ({ my_encryption_sk_string, my_encryption_pk_string }) =>
        setSetupData((prevState) => ({
          ...prevState,
          my_device_encryption_pk: my_encryption_pk_string,
          my_device_encryption_sk: my_encryption_sk_string,
        }))
    );
    generateSignatureKeys().then(
      ({ my_identity_pk_string, my_identity_sk_string }) =>
        setSetupData((prevState) => ({
          ...prevState,
          my_device_identity_pk: my_identity_pk_string,
          my_device_identity_sk: my_identity_sk_string,
        }))
    );

    // Profile Keys
    seed = crypto.getRandomValues(new Uint8Array(32));
    generateEncryptionKeys(seed).then(
      ({ my_encryption_sk_string, my_encryption_pk_string }) =>
        setSetupData((prevState) => ({
          ...prevState,
          profile_encryption_pk: my_encryption_pk_string,
          profile_encryption_sk: my_encryption_sk_string,
        }))
    );
    generateSignatureKeys().then(
      ({ my_identity_pk_string, my_identity_sk_string }) =>
        setSetupData((prevState) => ({
          ...prevState,
          profile_identity_pk: my_identity_pk_string,
          profile_identity_sk: my_identity_sk_string,
        }))
    );
  }, []);

  const updateSetupData = (data: Partial<MergedSetupType>) => {
    setSetupData((prevState) => ({ ...prevState, ...data }));
  };

  const handleScan = async (data: any) => {
    if (data) {
      const result = JSON.parse(data);
      console.log('Prev. QR Code Data:', setupData);
      updateSetupData(result);
      console.log('New QR Code Data:', setupData);
    }
  };

  const handleImageUpload = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: isPlatform('desktop')
          ? CameraSource.Photos
          : CameraSource.Prompt,
      });
      const codeReader = new BrowserQRCodeReader();
      const resultImage = await codeReader.decodeFromImageUrl(image.dataUrl);
      const json_string = resultImage.getText();
      const parsedData: QRSetupData = JSON.parse(json_string);
      updateSetupData(parsedData);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleError = (err: Error) => {
    console.error(err);
  };

  const handleQRScan = async () => {
    if (isPlatform('capacitor')) {
      const result = await BarcodeScanner.startScan();
      if (result.hasContent) {
        handleScan(result.content);
      }
    }
  };

  const finishSetup = async () => {
    if (!setupData) return;
    if (mode === 'Automatic') {
      await submitRegistrationNocode(setupData);
    } else if (mode === 'Manual') {
      await submitRegistration(setupData);
    }
  };

  return (
    <IonPage>
      {/*<IonHeaderCustom>*/}
      {/*  <IonTitle className="container text-accent text-center">*/}
      {/*    Connect*/}
      {/*  </IonTitle>*/}
      {/*</IonHeaderCustom>*/}

      <IonContent fullscreen>
        {error && (
          <IonToast color="danger" duration={2000} message={error.message} />
        )}
        <div className="relative flex h-full min-h-screen-ios lg:p-6 md:px-6 md:pt-16 md:pb-10 bg-slate-900">
          <div className="relative hidden shrink-0 w-[40rem] p-20 overflow-hidden 2xl:w-[37.5rem] xl:w-[30rem] lg:p-10 lg:block">
            <div className="max-w-[25.4rem]">
              <div
                className="mb-4 text-7xl font-bold leading-none uppercase font-newake text-white"
                data-cy="shinkai-app-description"
              >
                AI AGENT OS THAT UNLOCKS THE POTENTIAL OF LLMs
              </div>
              <div className="text-lg text-slate-900">
                For devices, identities, and digital money
              </div>
            </div>
            <div className="h-[16rem] mt-20 flex justify-center">
              <img
                alt=""
                className="inline-block align-top opacity-0 transition-opacity opacity-100 object-contain h-full"
                src="/messaging.png"
              />
            </div>
          </div>
          <div className="flex grow p-10 md:rounded-[1.25rem] bg-white dark:bg-slate-800 overflow-auto ">
            <div className="w-full max-w-[31.5rem] mx-auto pt-10">
              <a href="https://shinkai.com/" rel="noreferrer" target="_blank">
                <img
                  alt=""
                  className="block dark:hidden mx-auto mb-10"
                  src="/shinkai-logo.svg"
                />
                <img
                  alt=""
                  className="hidden dark:block mx-auto mb-10"
                  src="/shinkai-logo-white.svg"
                />
              </a>

              <div className="rounded-xl border border-slate-100 pb-5 md:pb-10 dark:border-slate-700">
                <IonSegment
                  class="ion-segment"
                  onIonChange={(e) =>
                    setMode(e.detail.value as 'Automatic' | 'Manual')
                  }
                  style={{ marginBottom: '20px' }}
                  value={mode}
                >
                  <IonSegmentButton value="Automatic">
                    <IonLabel>Automatic</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="Manual">
                    <IonLabel>Manual</IonLabel>
                  </IonSegmentButton>
                </IonSegment>
                <div className="px-5">
                  {mode === 'Manual' && (
                    <>
                      <div className="space-y-2">
                        <Button
                          onClick={handleImageUpload}
                          variant={'secondary'}
                        >
                          <IonIcon
                            className="mr-4"
                            icon={cloudUpload}
                            slot="icon-only"
                          />
                          Upload QR Code
                        </Button>
                        {isPlatform('capacitor') ? (
                          <Button onClick={handleQRScan}>Scan QR Code</Button>
                        ) : (
                          <CustomQrScanner
                            containerStyle={{ width: '100%' }}
                            onDecode={handleScan}
                            onError={handleError}
                            scanDelay={300}
                          />
                        )}
                      </div>
                      <hr className="w-full border-b border-gray-300 dark:border-slate-600/60 mt-6 mb-6" />
                    </>
                  )}
                  <div className="space-y-5">
                    <Input
                      label="Registration Name (Your choice)"
                      onChange={(e) =>
                        updateSetupData({ registration_name: e.detail.value! })
                      }
                      value={setupData.registration_name}
                    />
                    <Input
                      label="Node Address (IP:PORT)"
                      onChange={(e) =>
                        updateSetupData({ node_address: e.detail.value! })
                      }
                      value={setupData.node_address}
                    />
                    <Input
                      label="Shinkai Identity (@@IDENTITY.shinkai)"
                      onChange={(e) =>
                        updateSetupData({ shinkai_identity: e.detail.value! })
                      }
                      value={setupData.shinkai_identity}
                    />
                    {mode === 'Manual' && (
                      <>
                        <Input
                          label="Registration Code"
                          onChange={(e) =>
                            updateSetupData({
                              registration_code: e.detail.value!,
                            })
                          }
                          value={setupData.registration_code}
                        />
                        <Input
                          label="Node Encryption Public Key"
                          onChange={(e) =>
                            updateSetupData({
                              node_encryption_pk: e.detail.value!,
                            })
                          }
                          value={setupData.node_encryption_pk}
                        />
                        <Input
                          label="Node Signature Public Key"
                          onChange={(e) =>
                            updateSetupData({
                              node_signature_pk: e.detail.value!,
                            })
                          }
                          value={setupData.node_signature_pk}
                        />
                        <Input
                          label="Profile Encryption Public Key"
                          onChange={(e) =>
                            updateSetupData({
                              profile_encryption_pk: e.detail.value!,
                            })
                          }
                          value={setupData.profile_encryption_pk}
                        />
                        <Input
                          label="Profile Signature Public Key"
                          onChange={(e) =>
                            updateSetupData({
                              profile_identity_pk: e.detail.value!,
                            })
                          }
                          value={setupData.profile_identity_pk}
                        />
                        <Input
                          label="My Encryption Public Key"
                          onChange={(e) =>
                            updateSetupData({
                              my_device_encryption_pk: e.detail.value!,
                            })
                          }
                          value={setupData.my_device_encryption_pk}
                        />
                        <Input
                          label="My Signature Public Key"
                          onChange={(e) =>
                            updateSetupData({
                              my_device_identity_pk: e.detail.value!,
                            })
                          }
                          value={setupData.my_device_identity_pk}
                        />
                      </>
                    )}
                    {isError && (
                      <p
                        className={'text-red-600 text-base text-center'}
                        role={'alert'}
                      >
                        Something went wrong. Please check your inputs and try
                        again
                      </p>
                    )}
                    <Button
                      className="mt-6"
                      disabled={isLoading}
                      onClick={finishSetup}
                    >
                      {isLoading ? (
                        <IonSpinner className={'w-10 h-10'} name="bubbles" />
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Connect;

function CustomQrScanner({
  onError,
  onDecode,
  scanDelay,
  containerStyle,
}: {
  onError: QrScannerProps['onError'];
  onDecode: QrScannerProps['onDecode'];
  containerStyle: React.CSSProperties;
  scanDelay: number;
}) {
  const [showScanner, setShowScanner] = useState(false);
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'error' | 'success'
  >('idle');

  return showScanner ? (
    <div className="relative">
      <QrScanner
        containerStyle={containerStyle}
        onDecode={onDecode}
        onError={onError}
        onResult={(result) => {
          setStatus('success');
          setShowScanner(false);
        }}
        scanDelay={scanDelay}
      />
      <Button
        className="absolute bottom-2 z-10 max-w-[80px] left-1/2 transform -translate-x-1/2"
        onClick={() => setShowScanner(false)}
        variant={'tertiary'}
      >
        Close
      </Button>
      <IonToast
        duration={5000}
        icon={checkmarkSharp}
        isOpen={status === 'success'}
        message={'QR Code scanned successfully!'}
      ></IonToast>
    </div>
  ) : (
    <Button
      className="mt-6"
      onClick={() => setShowScanner(true)}
      variant={'secondary'}
    >
      <IonIcon className="mr-4" icon={scan} slot="icon-only" />
      Scan QR Code
    </Button>
  );
}
