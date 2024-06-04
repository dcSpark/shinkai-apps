import './Connect.css';

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { ErrorMessage } from '@hookform/error-message';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IonContent,
  IonIcon,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonToast,
} from '@ionic/react';
import { isPlatform } from '@ionic/react';
import {
  QRSetupData,
  SetupPayload,
} from '@shinkai_network/shinkai-message-ts/models';
import {
  generateEncryptionKeys,
  generateSignatureKeys,
} from '@shinkai_network/shinkai-message-ts/utils';
import { useSubmitRegistration } from '@shinkai_network/shinkai-node-state/lib/mutations/submitRegistation/useSubmitRegistration';
import { useSubmitRegistrationNoCode } from '@shinkai_network/shinkai-node-state/lib/mutations/submitRegistation/useSubmitRegistrationNoCode';
import { useQueryClient } from '@tanstack/react-query';
// import { QrScanner, QrScannerProps } from '@yudiel/react-qr-scanner';
import { BrowserQRCodeReader } from '@zxing/browser';
import {
  // checkmarkSharp,
  cloudUpload,
  // scan
} from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router';
import { toast } from 'sonner';
import * as z from 'zod';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../store/auth';

export type MergedSetupType = SetupPayload &
  QRSetupData & {
    profile_encryption_pk: string;
    profile_identity_pk: string;
    my_device_encryption_pk: string;
    my_device_identity_pk: string;
  };

const formSchema = z.object({
  registration_code: z.string(),
  profile: z.string(),
  registration_name: z.string(),
  identity_type: z.string(),
  permission_type: z.string(),
  node_address: z.string().url({
    message: 'Node Address must be a valid URL',
  }),
  shinkai_identity: z.string(),
  node_encryption_pk: z.string(),
  node_signature_pk: z.string(),
  profile_encryption_sk: z.string(),
  profile_encryption_pk: z.string(),
  profile_identity_sk: z.string(),
  profile_identity_pk: z.string(),
  my_device_encryption_sk: z.string(),
  my_device_encryption_pk: z.string(),
  my_device_identity_sk: z.string(),
  my_device_identity_pk: z.string(),
});

const Connect = () => {
  const history = useHistory();
  const queryClient = useQueryClient();
  const setAuth = useAuth((state) => state.setAuth);
  const setLogout = useAuth((state) => state.setLogout);
  const [mode, setMode] = useState<'Automatic' | 'Manual'>('Automatic');

  const setupDataForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      node_address: 'http://localhost:9550',
      registration_code: '',
      profile: 'main',
      registration_name: 'main_device',
      identity_type: 'device',
      permission_type: 'admin',
      shinkai_identity: '@@localhost.shinkai', // this should actually be read from ENV
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
    },
  });

  console.log('setupDataForm', setupDataForm.getValues());
  const {
    isPending,
    mutateAsync: submitRegistration,
    isError,
    error,
  } = useSubmitRegistration({
    onSuccess: (response) => {
      if (!response) throw new Error('Failed to submit registration');
      const values = setupDataForm.getValues();
      setAuth({
        profile: values.profile,
        permission_type: values.permission_type,
        node_address: values.node_address,
        shinkai_identity: values.shinkai_identity,
        node_signature_pk: values.node_signature_pk ?? '',
        node_encryption_pk: values.node_encryption_pk ?? '',
        registration_name: values.registration_name,
        my_device_identity_pk: values.my_device_identity_pk,
        my_device_identity_sk: values.my_device_identity_sk,
        my_device_encryption_pk: values.my_device_encryption_pk,
        my_device_encryption_sk: values.my_device_encryption_sk,
        profile_identity_pk: values.profile_identity_pk,
        profile_identity_sk: values.profile_identity_sk,
        profile_encryption_pk: values.profile_encryption_pk,
        profile_encryption_sk: values.profile_encryption_sk,
      });
      history.push('/home');
    },
    onError: (error) => {
      console.log('Error from submitRegistration', error);
      toast.error(error.message);
    },
  });

  useEffect(() => {
    setLogout();
    queryClient.clear();

    fetch('http://127.0.0.1:9550/v1/shinkai_health')
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'ok') {
          setupDataForm.setValue('node_address', 'http://127.0.0.1:9550');
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
      ({ my_encryption_sk_string, my_encryption_pk_string }) => {
        setupDataForm.setValue(
          'my_device_encryption_pk',
          my_encryption_pk_string,
        );
        setupDataForm.setValue(
          'my_device_encryption_sk',
          my_encryption_sk_string,
        );
      },
    );
    generateSignatureKeys().then(
      ({ my_identity_pk_string, my_identity_sk_string }) => {
        setupDataForm.setValue('my_device_identity_pk', my_identity_pk_string);
        setupDataForm.setValue('my_device_identity_sk', my_identity_sk_string);
      },
    );

    // Profile Keys
    seed = crypto.getRandomValues(new Uint8Array(32));
    generateEncryptionKeys(seed).then(
      ({ my_encryption_sk_string, my_encryption_pk_string }) => {
        setupDataForm.setValue(
          'profile_encryption_pk',
          my_encryption_pk_string,
        );
        setupDataForm.setValue(
          'profile_encryption_sk',
          my_encryption_sk_string,
        );
      },
    );
    generateSignatureKeys().then(
      ({ my_identity_pk_string, my_identity_sk_string }) => {
        setupDataForm.setValue('profile_identity_pk', my_identity_pk_string);
        setupDataForm.setValue('profile_identity_sk', my_identity_sk_string);
      },
    );
  }, [setupDataForm]);

  // const handleScan = async (data: string) => {
  //   if (data) {
  //     const result = JSON.parse(data);
  //     setupDataForm.reset((prev) => ({
  //       ...prev,
  //       ...result,
  //     }));
  //   }
  // };

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
      setupDataForm.reset((prev) => ({
        ...prev,
        ...parsedData,
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  // const handleError = (err: Error) => {
  //   console.error(err);
  // };
  //
  // const handleQRScan = async () => {
  //   if (isPlatform('capacitor')) {
  //     const result = await BarcodeScanner.startScan();
  //     if (result.hasContent) {
  //       handleScan(result.content);
  //     }
  //   }
  // };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await submitRegistration({
      my_device_encryption_sk: data.my_device_encryption_sk,
      my_device_identity_sk: data.my_device_identity_sk,
      profile_encryption_sk: data.profile_encryption_sk,
      profile_identity_sk: data.profile_identity_sk,
      node_encryption_pk: data.node_encryption_pk ?? '',
      registration_code: data.registration_code ?? '',
      identity_type: data.identity_type,
      permission_type: data.permission_type,
      registration_name: data.registration_name,
      profile: data.profile,
      shinkai_identity: data.shinkai_identity,
      node_address: data.node_address,
    });
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
        <div className="min-h-screen-ios relative flex h-full bg-slate-900 md:px-6 md:pb-10 md:pt-16 lg:p-6">
          <div className="relative hidden w-[40rem] shrink-0 overflow-hidden p-20 lg:block lg:p-10 xl:w-[30rem] 2xl:w-[37.5rem]">
            <div className="max-w-[25.4rem]">
              <div
                className="font-newake mb-4 text-7xl font-bold uppercase leading-none text-white"
                data-cy="shinkai-app-description"
              >
                AI AGENT OS THAT UNLOCKS THE POTENTIAL OF LLMs
              </div>
              <div className="text-lg text-slate-900">
                For devices, identities, and digital money
              </div>
            </div>
            <div className="mt-20 flex h-[16rem] justify-center">
              <img
                alt=""
                className="inline-block h-full object-contain align-top opacity-0 opacity-100 transition-opacity"
                src="/messaging.png"
              />
            </div>
          </div>
          <div className="flex grow overflow-auto bg-white p-10 md:rounded-[1.25rem] dark:bg-slate-800 ">
            <div className="mx-auto w-full max-w-[31.5rem] pt-10">
              <a href="https://shinkai.com/" rel="noreferrer" target="_blank">
                <img
                  alt=""
                  className="mx-auto mb-10 block dark:hidden"
                  src="/shinkai-logo.svg"
                />
                <img
                  alt=""
                  className="mx-auto mb-10 hidden dark:block"
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
                  {mode === 'Automatic' ? (
                    <AutomaticForm />
                  ) : (
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
                        {/*{isPlatform('capacitor') ? (*/}
                        {/*  <Button onClick={handleQRScan}>Scan QR Code</Button>*/}
                        {/*) : (*/}
                        {/*  <CustomQrScanner*/}
                        {/*    containerStyle={{ width: '100%' }}*/}
                        {/*    onDecode={handleScan}*/}
                        {/*    onError={handleError}*/}
                        {/*    scanDelay={300}*/}
                        {/*  />*/}
                        {/*)}*/}
                      </div>
                      <hr className="mb-6 mt-6 w-full border-b border-gray-300 dark:border-slate-600/60" />
                      <form
                        className="space-y-5"
                        onSubmit={setupDataForm.handleSubmit(onSubmit)}
                      >
                        <Controller
                          control={setupDataForm.control}
                          name="registration_name"
                          render={({ field }) => (
                            <div>
                              <Input
                                label="Registration Name (Your choice)"
                                {...field}
                                onChange={(e) =>
                                  setupDataForm.setValue(
                                    'registration_name',
                                    e.detail.value as string,
                                  )
                                }
                              />
                              <ErrorMessage
                                errors={setupDataForm.formState.errors}
                                name="registration_name"
                                render={({ message }) => (
                                  <p className="text-red-500">{message}</p>
                                )}
                              />
                            </div>
                          )}
                        />

                        <Controller
                          control={setupDataForm.control}
                          name="node_address"
                          render={({ field }) => (
                            <div>
                              <Input
                                label="Node Address (IP:PORT)"
                                {...field}
                                onChange={(e) =>
                                  setupDataForm.setValue(
                                    'node_address',
                                    e.detail.value as string,
                                  )
                                }
                              />
                              <ErrorMessage
                                errors={setupDataForm.formState.errors}
                                name="node_address"
                                render={({ message }) => (
                                  <p className="text-red-500">{message}</p>
                                )}
                              />
                            </div>
                          )}
                        />

                        <Controller
                          control={setupDataForm.control}
                          name="shinkai_identity"
                          render={({ field }) => (
                            <div>
                              <Input
                                label="Shinkai Identity (@@IDENTITY.shinkai)"
                                {...field}
                                onChange={(e) =>
                                  setupDataForm.setValue(
                                    'shinkai_identity',
                                    e.detail.value as string,
                                  )
                                }
                              />
                              <ErrorMessage
                                errors={setupDataForm.formState.errors}
                                name="shinkai_identity"
                                render={({ message }) => (
                                  <p className="text-red-500">{message}</p>
                                )}
                              />
                            </div>
                          )}
                        />

                        <Controller
                          control={setupDataForm.control}
                          name="registration_code"
                          render={({ field }) => (
                            <div>
                              <Input
                                label="Registration Code"
                                {...field}
                                onChange={(e) =>
                                  setupDataForm.setValue(
                                    'registration_code',
                                    e.detail.value as string,
                                  )
                                }
                              />
                              <ErrorMessage
                                errors={setupDataForm.formState.errors}
                                name="registration_code"
                                render={({ message }) => (
                                  <p className="text-red-500">{message}</p>
                                )}
                              />
                            </div>
                          )}
                        />

                        <Controller
                          control={setupDataForm.control}
                          name="node_encryption_pk"
                          render={({ field }) => (
                            <div>
                              <Input
                                label="Node Encryption Public Key"
                                {...field}
                                onChange={(e) =>
                                  setupDataForm.setValue(
                                    'node_encryption_pk',
                                    e.detail.value as string,
                                  )
                                }
                              />
                              <ErrorMessage
                                errors={setupDataForm.formState.errors}
                                name="node_encryption_pk"
                                render={({ message }) => (
                                  <p className="text-red-500">{message}</p>
                                )}
                              />
                            </div>
                          )}
                        />

                        <Controller
                          control={setupDataForm.control}
                          name="node_signature_pk"
                          render={({ field }) => (
                            <div>
                              <Input
                                label="Node Signature Public Key"
                                {...field}
                                onChange={(e) =>
                                  setupDataForm.setValue(
                                    'node_signature_pk',
                                    e.detail.value as string,
                                  )
                                }
                              />
                              <ErrorMessage
                                errors={setupDataForm.formState.errors}
                                name="node_signature_pk"
                                render={({ message }) => (
                                  <p className="text-red-500">{message}</p>
                                )}
                              />
                            </div>
                          )}
                        />

                        <Controller
                          control={setupDataForm.control}
                          name="profile_encryption_pk"
                          render={({ field }) => (
                            <div>
                              <Input
                                label="Profile Encryption Public Key"
                                {...field}
                                onChange={(e) =>
                                  setupDataForm.setValue(
                                    'profile_encryption_pk',
                                    e.detail.value as string,
                                  )
                                }
                              />
                              <ErrorMessage
                                errors={setupDataForm.formState.errors}
                                name="profile_encryption_pk"
                                render={({ message }) => (
                                  <p className="text-red-500">{message}</p>
                                )}
                              />
                            </div>
                          )}
                        />

                        <Controller
                          control={setupDataForm.control}
                          name="profile_identity_pk"
                          render={({ field }) => (
                            <div>
                              <Input
                                label="Profile Signature Public Key"
                                {...field}
                                onChange={(e) =>
                                  setupDataForm.setValue(
                                    'profile_identity_pk',
                                    e.detail.value as string,
                                  )
                                }
                              />
                              <ErrorMessage
                                errors={setupDataForm.formState.errors}
                                name="profile_identity_pk"
                                render={({ message }) => (
                                  <p className="text-red-500">{message}</p>
                                )}
                              />
                            </div>
                          )}
                        />

                        <Controller
                          control={setupDataForm.control}
                          name="my_device_encryption_pk"
                          render={({ field }) => (
                            <div>
                              <Input
                                label="My Encryption Public Key"
                                {...field}
                                onChange={(e) =>
                                  setupDataForm.setValue(
                                    'my_device_encryption_pk',
                                    e.detail.value as string,
                                  )
                                }
                              />
                              <ErrorMessage
                                errors={setupDataForm.formState.errors}
                                name="my_device_encryption_pk"
                                render={({ message }) => (
                                  <p className="text-red-500">{message}</p>
                                )}
                              />
                            </div>
                          )}
                        />

                        <Controller
                          control={setupDataForm.control}
                          name="my_device_identity_pk"
                          render={({ field }) => (
                            <div>
                              <Input
                                label="My Signature Public Key"
                                {...field}
                                onChange={(e) =>
                                  setupDataForm.setValue(
                                    'my_device_identity_pk',
                                    e.detail.value as string,
                                  )
                                }
                              />
                              <ErrorMessage
                                errors={setupDataForm.formState.errors}
                                name="my_device_identity_pk"
                                render={({ message }) => (
                                  <p className="text-red-500">{message}</p>
                                )}
                              />
                            </div>
                          )}
                        />
                        {isError && (
                          <p
                            className={'text-center text-base text-red-600'}
                            role={'alert'}
                          >
                            Something went wrong. Please check your inputs and
                            try again
                          </p>
                        )}
                        <Button
                          className="mt-6"
                          disabled={isPending}
                          isLoading={isPending}
                          type="submit"
                        >
                          Sign In
                        </Button>
                      </form>
                    </>
                  )}
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

function AutomaticForm() {
  const setAuth = useAuth((state) => state.setAuth);
  const history = useHistory();
  const setupDataForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      node_address: 'http://localhost:9550',
      registration_code: '',
      profile: 'main',
      registration_name: 'main_device',
      identity_type: 'device',
      permission_type: 'admin',
      shinkai_identity: '@@localhost.shinkai', // this should actually be read from ENV
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
    },
  });

  const {
    isPending: isSubmitRegistrationNoCodePending,
    mutateAsync: submitRegistrationNocode,
    isError,
    error,
  } = useSubmitRegistrationNoCode({
    onSuccess: (response) => {
      if (response.status !== 'success')
        throw new Error('Failed to submit registration');
      const values = setupDataForm.getValues();
      setAuth({
        profile: values.profile,
        permission_type: values.permission_type,
        node_address: values.node_address,
        shinkai_identity: values.shinkai_identity,
        node_signature_pk:
          response.data?.identity_public_key ?? values.node_signature_pk ?? '',
        node_encryption_pk:
          response.data?.encryption_public_key ??
          values.node_encryption_pk ??
          '',
        registration_name: values.registration_name,
        my_device_identity_pk: values.my_device_identity_pk,
        my_device_identity_sk: values.my_device_identity_sk,
        my_device_encryption_pk: values.my_device_encryption_pk,
        my_device_encryption_sk: values.my_device_encryption_sk,
        profile_identity_pk: values.profile_identity_pk,
        profile_identity_sk: values.profile_identity_sk,
        profile_encryption_pk: values.profile_encryption_pk,
        profile_encryption_sk: values.profile_encryption_sk,
      });
      history.push('/home');
    },
    onError: (error) => {
      console.log('Error from submitRegistrationNocode', error);
      toast.error(error.message);
    },
  });

  useEffect(() => {
    fetch('http://127.0.0.1:9550/v1/shinkai_health')
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'ok') {
          setupDataForm.setValue('node_address', 'http://127.0.0.1:9550');
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
      ({ my_encryption_sk_string, my_encryption_pk_string }) => {
        setupDataForm.setValue(
          'my_device_encryption_pk',
          my_encryption_pk_string,
        );
        setupDataForm.setValue(
          'my_device_encryption_sk',
          my_encryption_sk_string,
        );
      },
    );
    generateSignatureKeys().then(
      ({ my_identity_pk_string, my_identity_sk_string }) => {
        setupDataForm.setValue('my_device_identity_pk', my_identity_pk_string);
        setupDataForm.setValue('my_device_identity_sk', my_identity_sk_string);
      },
    );

    // Profile Keys
    seed = crypto.getRandomValues(new Uint8Array(32));
    generateEncryptionKeys(seed).then(
      ({ my_encryption_sk_string, my_encryption_pk_string }) => {
        setupDataForm.setValue(
          'profile_encryption_pk',
          my_encryption_pk_string,
        );
        setupDataForm.setValue(
          'profile_encryption_sk',
          my_encryption_sk_string,
        );
      },
    );
    generateSignatureKeys().then(
      ({ my_identity_pk_string, my_identity_sk_string }) => {
        setupDataForm.setValue('profile_identity_pk', my_identity_pk_string);
        setupDataForm.setValue('profile_identity_sk', my_identity_sk_string);
      },
    );
  }, [setupDataForm]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await submitRegistrationNocode({
      profile: values.profile,
      node_address: values.node_address,
      registration_name: values.registration_name,
      my_device_identity_sk: values.my_device_identity_sk,
      my_device_encryption_sk: values.my_device_encryption_sk,
      profile_identity_sk: values.profile_identity_sk,
      profile_encryption_sk: values.profile_encryption_sk,
    });
  };

  return (
    <form className="space-y-5" onSubmit={setupDataForm.handleSubmit(onSubmit)}>
      <Controller
        control={setupDataForm.control}
        name="registration_name"
        render={({ field }) => (
          <div>
            <Input
              label="Registration Name (Your choice)"
              {...field}
              onChange={(e) =>
                setupDataForm.setValue(
                  'registration_name',
                  e.detail.value as string,
                )
              }
            />
            <ErrorMessage
              errors={setupDataForm.formState.errors}
              name="registration_name"
              render={({ message }) => (
                <p className="text-red-500">{message}</p>
              )}
            />
          </div>
        )}
      />

      <Controller
        control={setupDataForm.control}
        name="node_address"
        render={({ field }) => (
          <div>
            <Input
              label="Node Address (IP:PORT)"
              {...field}
              onChange={(e) =>
                setupDataForm.setValue('node_address', e.detail.value as string)
              }
            />
            <ErrorMessage
              errors={setupDataForm.formState.errors}
              name="node_address"
              render={({ message }) => (
                <p className="text-red-500">{message}</p>
              )}
            />
          </div>
        )}
      />

      <Controller
        control={setupDataForm.control}
        name="shinkai_identity"
        render={({ field }) => (
          <div>
            <Input
              label="Shinkai Identity (@@IDENTITY.shinkai)"
              {...field}
              onChange={(e) =>
                setupDataForm.setValue(
                  'shinkai_identity',
                  e.detail.value as string,
                )
              }
            />
            <ErrorMessage
              errors={setupDataForm.formState.errors}
              name="shinkai_identity"
              render={({ message }) => (
                <p className="text-red-500">{message}</p>
              )}
            />
          </div>
        )}
      />
      {isError && (
        <p className={'text-center text-base text-red-600'} role={'alert'}>
          Something went wrong. Please check your inputs and try again.{' '}
          {error.message}
        </p>
      )}
      <Button
        className="mt-6"
        disabled={isSubmitRegistrationNoCodePending}
        isLoading={isSubmitRegistrationNoCodePending}
        type="submit"
      >
        Sign In
      </Button>
    </form>
  );
}

// function CustomQrScanner({
//   onError,
//   onDecode,
//   scanDelay,
//   containerStyle,
// }: {
//   onError: QrScannerProps['onError'];
//   onDecode: QrScannerProps['onDecode'];
//   containerStyle: React.CSSProperties;
//   scanDelay: number;
// }) {
//   const [showScanner, setShowScanner] = useState(false);
//   const [status, setStatus] = useState<
//     'idle' | 'loading' | 'error' | 'success'
//   >('idle');
//
//   return showScanner ? (
//     <div className="relative">
//       <QrScanner
//         containerStyle={containerStyle}
//         onDecode={onDecode}
//         onError={onError}
//         onResult={() => {
//           setStatus('success');
//           setShowScanner(false);
//         }}
//         scanDelay={scanDelay}
//       />
//       <Button
//         className="absolute bottom-2 left-1/2 z-10 max-w-[80px] -translate-x-1/2 transform"
//         onClick={() => setShowScanner(false)}
//         variant={'tertiary'}
//       >
//         Close
//       </Button>
//       <IonToast
//         duration={5000}
//         icon={checkmarkSharp}
//         isOpen={status === 'success'}
//         message={'QR Code scanned successfully!'}
//       />
//     </div>
//   ) : (
//     <Button
//       className="mt-6"
//       onClick={() => setShowScanner(true)}
//       variant={'secondary'}
//     >
//       <IonIcon className="mr-4" icon={scan} slot="icon-only" />
//       Scan QR Code
//     </Button>
//   );
// }
