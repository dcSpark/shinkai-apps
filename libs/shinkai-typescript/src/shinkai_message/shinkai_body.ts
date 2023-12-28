import {
  sign_inner_layer,
  verify_inner_layer_signature,
} from '../cryptography/shinkai_signing';
import { ShinkaiData } from './shinkai_data';
import { InternalMetadata } from './shinkai_internal_metadata';
import { MessageData, UnencryptedMessageData } from './shinkai_message_data';

export interface IShinkaiBody {
  message_data: MessageData;
  internal_metadata: InternalMetadata;
  verify_inner_layer_signature(self_pk: Uint8Array): Promise<boolean>;
  sign_inner_layer(self_sk: Uint8Array): Promise<ShinkaiBody>;
}

export class ShinkaiBody implements IShinkaiBody {
  message_data: MessageData;
  internal_metadata: InternalMetadata;

  constructor(message_data: MessageData, internal_metadata: InternalMetadata) {
    this.message_data = message_data;
    this.internal_metadata = internal_metadata;
  }

  async verify_inner_layer_signature(self_pk: Uint8Array): Promise<boolean> {
    return verify_inner_layer_signature(self_pk, this);
  }

  async sign_inner_layer(self_sk: Uint8Array): Promise<ShinkaiBody> {
    const body_clone = new ShinkaiBody(
      this.message_data,
      this.internal_metadata,
    );
    await sign_inner_layer(self_sk, this);
    return body_clone;
  }

  static async createAndEncryptMessageData(
    data: ShinkaiData,
    internal_metadata: InternalMetadata,
    senderPrivateKey: Uint8Array,
    recipientPublicKey: Uint8Array,
  ): Promise<ShinkaiBody> {
    const message_data = await new UnencryptedMessageData(data).encrypt(
      senderPrivateKey,
      recipientPublicKey,
    );
    return new ShinkaiBody(message_data, internal_metadata);
  }
}
