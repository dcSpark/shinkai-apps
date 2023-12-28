import { encryptMessageBody } from '../cryptography/shinkai_encryption';
import { EncryptedShinkaiBody } from './encrypted_shinkai_body';
import { IShinkaiBody, ShinkaiBody } from './shinkai_body';

export abstract class MessageBody {
  abstract encrypt(
    self_sk: Uint8Array,
    destination_pk: Uint8Array,
  ): Promise<EncryptedMessageBody>;
}

export class EncryptedMessageBody extends MessageBody {
  encrypted: EncryptedShinkaiBody;

  constructor(encrypted: EncryptedShinkaiBody) {
    super();
    this.encrypted = encrypted;
  }

  async encrypt(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    self_sk: Uint8Array,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    destination_pk: Uint8Array,
  ): Promise<EncryptedMessageBody> {
    throw new Error('Message body is already encrypted');
  }
}

export class UnencryptedMessageBody extends MessageBody {
  unencrypted: IShinkaiBody;

  constructor(unencrypted: IShinkaiBody) {
    super();
    this.unencrypted = unencrypted;
  }

  async encrypt(
    self_sk: Uint8Array,
    destination_pk: Uint8Array,
  ): Promise<EncryptedMessageBody> {
    const encryptedBody = await encryptMessageBody(
      JSON.stringify(this.unencrypted),
      self_sk,
      destination_pk,
    );

    return new EncryptedMessageBody({ content: encryptedBody });
  }

  async verify_inner_layer_signature(self_pk: Uint8Array): Promise<boolean> {
    return this.unencrypted.verify_inner_layer_signature(self_pk);
  }
  async sign_inner_layer(self_sk: Uint8Array): Promise<ShinkaiBody> {
    return this.unencrypted.sign_inner_layer(self_sk);
  }
}
