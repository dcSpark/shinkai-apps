import { CloudUploadOutlined, LoadingOutlined } from '@ant-design/icons';
import { Player } from '@lottiefiles/react-lottie-player';
import { QRSetupData } from '@shinkai_network/shinkai-message-ts/models';
import {
  generateEncryptionKeys,
  generateSignatureKeys,
} from '@shinkai_network/shinkai-message-ts/utils';
import { BrowserQRCodeReader } from '@zxing/browser';
import { Button, Form, Input, Steps } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import ScanQrAnimation from '../../assets/animations/scan-qr.json';

type AddNodeFieldType = {
  registrationCode?: string;
  registrationName?: string;
  nodeAddress?: string;
  shinkaiIdentity?: string;
  nodeEncryptionPublicKey?: string;
  nodeSignaturePublicKey?: string;
  profileEncryptionPublicKey?: string;
  profileSignaturePublicKey?: string;
  myDeviceEncryptionPublicKey?: string;
  myDeviceIdentityPublicKey?: string;
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
  ReviewData,
  Connect,
}

export const AddNode = () => {
  const intl = useIntl();
  const [form] = Form.useForm<AddNodeFieldType>();
  const fileInput = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState<AddNodeSteps>(
    AddNodeSteps.ScanQR
  );

  const initialValues: Partial<AddNodeFieldType> = {
    registrationName: '',
    profileEncryptionPublicKey: '',
    profileSignaturePublicKey: '',
    myDeviceEncryptionPublicKey: '',
    myDeviceIdentityPublicKey: '',
  };

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
    form.setFieldsValue(nodeDataFromQr);
    setCurrentStep(1);
  };

  const generateDeviceEncryptionKeys = async (): Promise<
    Pick<AddNodeFieldType, 'myDeviceEncryptionPublicKey'>
  > => {
    const seed = crypto.getRandomValues(new Uint8Array(32));
    const { my_encryption_pk_string } = await generateEncryptionKeys(seed);
    return {
      myDeviceEncryptionPublicKey: my_encryption_pk_string,
    };
  };

  const generateDeviceSignatureKeys = async (): Promise<
    Pick<AddNodeFieldType, 'myDeviceIdentityPublicKey'>
  > => {
    const { my_identity_pk_string } = await generateSignatureKeys();
    return {
      myDeviceIdentityPublicKey: my_identity_pk_string,
    };
  };

  const generateProfileEncryptionKeys = async (): Promise<
    Pick<AddNodeFieldType, 'profileEncryptionPublicKey'>
  > => {
    const seed = crypto.getRandomValues(new Uint8Array(32));
    const { my_encryption_pk_string } = await generateEncryptionKeys(seed);
    return {
      profileEncryptionPublicKey: my_encryption_pk_string,
    };
  };

  const generateProfileSignatureKeys = async (): Promise<
    Pick<AddNodeFieldType, 'profileSignaturePublicKey'>
  > => {
    const { my_identity_pk_string } = await generateSignatureKeys();
    return {
      profileSignaturePublicKey: my_identity_pk_string,
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
    setCurrentStep(AddNodeSteps.ReviewData);
  };

  const scanQr = () => {
    setCurrentStep(AddNodeSteps.ScanQR);
  };

  const connect = () => {
    setCurrentStep(AddNodeSteps.Connect);
  };

  const isConnecting = (): boolean => {
    return currentStep === AddNodeSteps.Connect;
  };

  const connectingStatus = (): 'process' | 'wait' => {
    console.log(
      'connectingStatus',
      currentStep === AddNodeSteps.Connect ? 'process' : 'wait'
    );
    return isConnecting() ? 'process' : 'wait';
  };

  useEffect(() => {
    generateDeviceEncryptionKeys().then((keys) => form.setFieldsValue(keys));
    generateDeviceSignatureKeys().then((keys) => form.setFieldsValue(keys));
    generateProfileEncryptionKeys().then((keys) => form.setFieldsValue(keys));
    generateProfileSignatureKeys().then((keys) => form.setFieldsValue(keys));
  }, [form]);

  return (
    <div className="h-full flex flex-col space-y-3">
      <Steps
        current={currentStep}
        items={[
          { title: intl.formatMessage({ id: 'scan' }) },
          { title: intl.formatMessage({ id: 'review' }) },
          {
            title: intl.formatMessage({ id: 'connect' }),
            status: connectingStatus(),
            icon: isConnecting() ? <LoadingOutlined /> : null,
          },
        ]}
        labelPlacement="vertical"
        responsive={false}
        size="small"
      />
      <div className="h-full flex flex-col grow place-content-center">
        {currentStep === 0 && (
          <div className="flex flex-col space-y-6">
            <Player
              autoplay
              className="w-40"
              loop
              src={ScanQrAnimation}
            ></Player>
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

        {(currentStep === 1 || currentStep === 2) && (
          <Form
            autoComplete="off"
            disabled={isConnecting()}
            form={form}
            initialValues={initialValues}
          >
            <Form.Item<AddNodeFieldType>
              name="registrationCode"
              rules={[{ required: true, message: '', whitespace: true }]}
            >
              <Input
                placeholder={intl.formatMessage({ id: 'registration-code' })}
              />
            </Form.Item>
            <Form.Item<AddNodeFieldType>
              hidden={true}
              name="registrationName"
              rules={[{ required: true, message: '', whitespace: true }]}
            >
              <Input
                placeholder={intl.formatMessage({ id: 'registration-name' })}
              />
            </Form.Item>
            <Form.Item<AddNodeFieldType>
              name="nodeAddress"
              rules={[{ required: true, message: '', whitespace: true }]}
            >
              <Input placeholder={intl.formatMessage({ id: 'node-address' })} />
            </Form.Item>
            <Form.Item<AddNodeFieldType>
              name="shinkaiIdentity"
              rules={[{ required: true, message: '', whitespace: true }]}
            >
              <Input
                placeholder={intl.formatMessage({ id: 'shinkai-identity' })}
              />
            </Form.Item>
            <Form.Item<AddNodeFieldType>
              name="nodeEncryptionPublicKey"
              rules={[{ required: true, message: '', whitespace: true }]}
            >
              <Input
                placeholder={intl.formatMessage({
                  id: 'node-encryption-public-key',
                })}
              />
            </Form.Item>
            <Form.Item<AddNodeFieldType>
              name="nodeSignaturePublicKey"
              rules={[{ required: true, message: '', whitespace: true }]}
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
              rules={[{ required: true, message: '', whitespace: true }]}
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
              rules={[{ required: true, message: '', whitespace: true }]}
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
              rules={[{ required: true, message: '', whitespace: true }]}
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
              rules={[{ required: true, message: '', whitespace: true }]}
            >
              <Input
                placeholder={intl.formatMessage({
                  id: 'my-signature-public-key',
                })}
              />
            </Form.Item>

            <Form.Item>
              <div className="flex flex-col space-y-1">
                <Button
                  className="w-full"
                  htmlType="submit"
                  onClick={() => connect()}
                  type="primary"
                >
                  <FormattedMessage id="connect" />
                </Button>
                <span
                  className={`italic text-xs place-self-end cursor-pointer ${
                    isConnecting() ? 'hidden' : ''
                  }`}
                  onClick={() => scanQr()}
                >
                  <FormattedMessage id="use-qr-code" />
                </span>
              </div>
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  );
};
