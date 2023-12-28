import { encryptMessageData } from '../cryptography/shinkai_encryption';
import { EncryptedShinkaiData } from './encrypted_shinkai_data';
import { ShinkaiData } from './shinkai_data';

export abstract class MessageData {
  abstract encrypt(
    senderPrivateKey: Uint8Array,
    recipientPublicKey: Uint8Array,
  ): Promise<EncryptedMessageData>;
}

export class EncryptedMessageData extends MessageData {
  data: EncryptedShinkaiData;

  constructor(data: EncryptedShinkaiData) {
    super();
    this.data = data;
  }

  async encrypt(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    senderPrivateKey: Uint8Array,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    recipientPublicKey: Uint8Array,
  ): Promise<EncryptedMessageData> {
    throw new Error('Data is already encrypted');
  }
}

export class UnencryptedMessageData extends MessageData {
  unencrypted: ShinkaiData;

  constructor(data: ShinkaiData) {
    super();
    this.unencrypted = data;
  }

  async encrypt(
    senderPrivateKey: Uint8Array,
    recipientPublicKey: Uint8Array,
  ): Promise<EncryptedMessageData> {
    // Encrypt the message data
    const encryptedData = await encryptMessageData(
      this.unencrypted,
      senderPrivateKey,
      recipientPublicKey,
    );

    return new EncryptedMessageData({ content: encryptedData });
  }
}
