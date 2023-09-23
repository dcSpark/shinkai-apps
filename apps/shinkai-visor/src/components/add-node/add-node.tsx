import { CloudUploadOutlined, LoadingOutlined } from '@ant-design/icons';
import { Player } from '@lottiefiles/react-lottie-player';
import { QRSetupData } from '@shinkai_network/shinkai-message-ts/models';
import {
  generateEncryptionKeys,
  generateSignatureKeys,
} from '@shinkai_network/shinkai-message-ts/utils';
import { BrowserQRCodeReader } from '@zxing/browser';
import { Button, Form, Input, message, Steps } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import ScanQrAnimation from '../../assets/animations/scan-qr.json';
import { RootState, useTypedDispatch } from '../../store';
import { connectNode } from '../../store/node/node-actions';

type AddNodeFieldType = {
  registrationCode: string;
  registrationName: string;
  permissionType: 'admin';
  identityType: 'device';
  profile: 'main';
  nodeAddress: string;
  shinkaiIdentity: string;
  nodeEncryptionPublicKey: string;
  nodeSignaturePublicKey: string;
  profileEncryptionPublicKey: string;
  profileSignaturePublicKey: string;
  myDeviceEncryptionPublicKey: string;
  myDeviceIdentityPublicKey: string;
  profileEncryptionSharedKey: string;
  profileSignatureSharedKey: string;
  myDeviceEncryptionSharedKey: string;
  myDeviceIdentitySharedKey: string;
};

type AddNodeDataFromQr = Pick<
  AddNodeFieldType,
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
  const intl = useIntl();
  const history = useHistory();
  const [form] = Form.useForm<AddNodeFieldType>();
  const fileInput = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState<AddNodeSteps>(
    AddNodeSteps.ScanQR
  );
  const [submittable, setSubmittable] = useState(false);
  const currentFormValue = Form.useWatch([], form);
  const isConnecting = useSelector(
    (state: RootState) => state?.node?.status === 'loading'
  );
  const [messageApi, contextHolder] = message.useMessage();
  const dispatch = useTypedDispatch();
  const [initialValues, setInitialValues] = useState<Partial<AddNodeFieldType>>(
    {
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
      profileSignatureSharedKey: 'ss',
      myDeviceEncryptionSharedKey: '',
      myDeviceIdentitySharedKey: undefined,
    }
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
    const json_string = resultImage.getText();
    const parsedQrData: QRSetupData = JSON.parse(json_string);
    const nodeDataFromQr = getValuesFromQr(parsedQrData);
    form.setFieldsValue({ ...initialValues, ...nodeDataFromQr });
    setCurrentStep(AddNodeSteps.Connect);
  };

  const generateDeviceEncryptionKeys = async (): Promise<
    Pick<
      AddNodeFieldType,
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
    Pick<
      AddNodeFieldType,
      'myDeviceIdentityPublicKey' | 'myDeviceIdentitySharedKey'
    >
  > => {
    const { my_identity_pk_string, my_identity_sk_string } =
      await generateSignatureKeys();
    return {
      myDeviceIdentityPublicKey: my_identity_pk_string,
      myDeviceIdentitySharedKey: my_identity_sk_string,
    };
  };

  const generateProfileEncryptionKeys = async (): Promise<
    Pick<
      AddNodeFieldType,
      'profileEncryptionPublicKey' | 'profileEncryptionSharedKey'
    >
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
    Pick<
      AddNodeFieldType,
      'profileSignaturePublicKey' | 'profileSignatureSharedKey'
    >
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
    form.setFieldsValue(initialValues);
    setCurrentStep(AddNodeSteps.ScanQR);
  };

  const connect = () => {
    setCurrentStep(AddNodeSteps.Connect);
    dispatch(
      connectNode({
        nodeData: {
          registrationCode: currentFormValue.registrationCode,
          profile: currentFormValue.profile,
          identityType: currentFormValue.identityType,
          permissionType: currentFormValue.permissionType,
          nodeAddress: currentFormValue.nodeAddress,
          shinkaiIdentity: currentFormValue.shinkaiIdentity,
          nodeEncryptionPublicKey: currentFormValue.nodeEncryptionPublicKey,
          nodeSignaturePublicKey: currentFormValue.nodeSignaturePublicKey,
        },
        userData: {
          registrationName: currentFormValue.registrationName,
        },
        credentials: {
          myDeviceIdentityPublicKey:
            currentFormValue.myDeviceEncryptionPublicKey,
          myDeviceIdentitySharedKey:
            currentFormValue.myDeviceEncryptionSharedKey,

          myDeviceEncryptionPublicKey:
            currentFormValue.myDeviceIdentityPublicKey,
          myDeviceEncryptionSharedKey:
            currentFormValue.myDeviceEncryptionSharedKey,

          profileSignaturePublicKey: currentFormValue.profileSignaturePublicKey,
          profileSignatureSharedKey: currentFormValue.profileSignatureSharedKey,

          profileEncryptionPublicKey:
            currentFormValue.profileEncryptionPublicKey,
          profileEncryptionSharedKey:
            currentFormValue.profileEncryptionSharedKey,
        },
      })
    )
      .unwrap()
      .then(() => {
        history.replace('/inboxes/all');
      })
      .catch(() => {
        messageApi.open({
          type: 'error',
          content: 'Error connecting node',
        });
      });
  };

  const connectingStatus = (): 'process' | 'wait' => {
    return isConnecting ? 'process' : 'wait';
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
        setInitialValues((prevInitialValues) => ({
          ...prevInitialValues,
          ...deviceEncryption,
          ...deviceSignature,
          ...profileEncryption,
          ...profileSignature,
        }));
      }
    );
  }, []);
  useEffect(() => {
    form.validateFields({ validateOnly: true, recursive: true }).then(
      () => {
        setSubmittable(true);
      },
      () => {
        setSubmittable(false);
      }
    );
  }, [form, currentFormValue]);

  return (
    <div className="h-full flex flex-col space-y-3">
      {contextHolder}
      <Steps
        current={currentStep}
        items={[
          { title: intl.formatMessage({ id: 'scan' }) },
          {
            title: intl.formatMessage({ id: 'connect' }),
            status: connectingStatus(),
            icon: isConnecting ? <LoadingOutlined /> : null,
          },
        ]}
        labelPlacement="vertical"
        responsive={false}
        size="small"
      />
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
              <Button
                className="w-full"
                htmlType="submit"
                icon={<CloudUploadOutlined />}
                onClick={onFileInputClick}
                type="primary"
              >
                <span>
                  <FormattedMessage id="upload-qr-code" />
                </span>
              </Button>
              <span
                className="italic text-xs place-self-end cursor-pointer"
                onClick={() => connectManually()}
              >
                <FormattedMessage id="connect-manually" />
              </span>
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
          <div className="h-full flex flex-col space-y-6 justify-between">
            <Form
              autoComplete="off"
              className="h-full"
              disabled={isConnecting}
              form={form}
            >
              <Form.Item<AddNodeFieldType>
                name="registrationCode"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder={intl.formatMessage({ id: 'registration-code' })}
                />
              </Form.Item>
              <Form.Item<AddNodeFieldType>
                hidden={true}
                name="registrationName"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder={intl.formatMessage({ id: 'registration-name' })}
                />
              </Form.Item>
              <Form.Item<AddNodeFieldType>
                name="nodeAddress"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder={intl.formatMessage({ id: 'node-address' })}
                />
              </Form.Item>
              <Form.Item<AddNodeFieldType>
                name="shinkaiIdentity"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder={intl.formatMessage({ id: 'shinkai-identity' })}
                />
              </Form.Item>
              <Form.Item<AddNodeFieldType>
                name="nodeEncryptionPublicKey"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder={intl.formatMessage({
                    id: 'node-encryption-public-key',
                  })}
                />
              </Form.Item>
              <Form.Item<AddNodeFieldType>
                name="nodeSignaturePublicKey"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder={intl.formatMessage({
                    id: 'node-signature-public-key',
                  })}
                />
              </Form.Item>
              <Form.Item<AddNodeFieldType>
                hidden={true}
                name="profileEncryptionPublicKey"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder={intl.formatMessage({
                    id: 'profile-encryption-public-key',
                  })}
                />
              </Form.Item>
              <Form.Item<AddNodeFieldType>
                hidden={true}
                name="profileSignaturePublicKey"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder={intl.formatMessage({
                    id: 'profile-signature-public-key',
                  })}
                />
              </Form.Item>
              <Form.Item<AddNodeFieldType>
                hidden={true}
                name="myDeviceEncryptionPublicKey"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder={intl.formatMessage({
                    id: 'my-encryption-public-key',
                  })}
                />
              </Form.Item>
              <Form.Item<AddNodeFieldType>
                hidden={true}
                name="myDeviceIdentityPublicKey"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder={intl.formatMessage({
                    id: 'my-signature-public-key',
                  })}
                />
              </Form.Item>

              <Form.Item<AddNodeFieldType>
                hidden={true}
                name="profileEncryptionSharedKey"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item<AddNodeFieldType>
                hidden={true}
                name="profileSignatureSharedKey"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item<AddNodeFieldType>
                hidden={true}
                name="myDeviceEncryptionSharedKey"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item<AddNodeFieldType>
                hidden={true}
                name="myDeviceIdentitySharedKey"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item<AddNodeFieldType>
                hidden={true}
                name="permissionType"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item<AddNodeFieldType>
                hidden={true}
                name="identityType"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item<AddNodeFieldType>
                hidden={true}
                name="profile"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Form>
            <Form.Item>
              <div className="flex flex-col space-y-1">
                <Button
                  className="w-full"
                  disabled={isConnecting || !submittable}
                  htmlType="submit"
                  loading={isConnecting}
                  onClick={() => connect()}
                  type="primary"
                >
                  <FormattedMessage id="connect" />
                </Button>
                <span
                  className={`italic text-xs place-self-end cursor-pointer ${
                    isConnecting ? 'hidden' : ''
                  }`}
                  onClick={() => scanQr()}
                >
                  <FormattedMessage id="use-qr-code" />
                </span>
              </div>
            </Form.Item>
          </div>
        )}
      </div>
    </div>
  );
};
