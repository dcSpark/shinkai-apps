/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  MessageSchemaType,
  TSEncryptionMethod,
} from '../models/SchemaTypes.js';
import { ShinkaiMessageBuilderWrapper as ShinkaiMessageBuilderWrapperWASM } from '../pkg/shinkai_message_wasm.js';

export class ShinkaiMessageBuilderWrapper {
  private wasmBuilder: ShinkaiMessageBuilderWrapperWASM;

  constructor(
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
  ) {
    this.wasmBuilder = new ShinkaiMessageBuilderWrapperWASM(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );
  }

  body_encryption(encryption: keyof typeof TSEncryptionMethod): void {
    this.wasmBuilder.body_encryption(TSEncryptionMethod[encryption]);
  }

  message_raw_content(content: string): void {
    this.wasmBuilder.message_raw_content(content);
  }

  message_schema_type(content: string): void {
    this.wasmBuilder.message_schema_type(content);
  }

  internal_metadata(
    sender_subidentity: string,
    recipient_subidentity: string,
    inbox: string,
    encryption: keyof typeof TSEncryptionMethod,
  ): void {
    this.wasmBuilder.internal_metadata_with_inbox(
      sender_subidentity,
      recipient_subidentity,
      inbox,
      TSEncryptionMethod[encryption],
    );
  }

  external_metadata_with_intra(
    recipient: string,
    sender: string,
    intra_sender: string,
  ): void {
    this.wasmBuilder.external_metadata_with_intra(
      recipient,
      sender,
      intra_sender,
    );
  }

  build_to_string(): string {
    return this.wasmBuilder.build_to_string();
  }

  static ws_connection(
    ws_content: string,
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
    sender: string,
    sender_subidentity: string,
    receiver: string,
    receiver_subidentity: string,
  ): string {
    const builder = new ShinkaiMessageBuilderWrapper(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );

    builder.message_raw_content(ws_content);
    builder.message_schema_type(MessageSchemaType.WSMessage.toString());
    builder.internal_metadata(
      sender_subidentity,
      receiver_subidentity,
      '',
      'None',
    );
    builder.external_metadata_with_intra(receiver, sender, sender_subidentity);

    builder.body_encryption('DiffieHellmanChaChaPoly1305');

    const message = builder.build_to_string();
    return message;
  }
}
