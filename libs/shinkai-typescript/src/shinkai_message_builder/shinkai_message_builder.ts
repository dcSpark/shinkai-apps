import * as ed from 'noble-ed25519';
import nacl from 'tweetnacl';

import { InboxName } from '../schemas/inbox_name';
import {
  JobScope,
  MessageSchemaType,
  SerializedAgent,
  TSEncryptionMethod,
} from '../schemas/schema_types';
import { ShinkaiBody } from '../shinkai_message/shinkai_body';
import { ShinkaiData } from '../shinkai_message/shinkai_data';
import { ExternalMetadata } from '../shinkai_message/shinkai_external_metadata';
import { InternalMetadata } from '../shinkai_message/shinkai_internal_metadata';
import { ShinkaiMessage } from '../shinkai_message/shinkai_message';
import {
  MessageBody,
  UnencryptedMessageBody,
} from '../shinkai_message/shinkai_message_body';
import { UnencryptedMessageData } from '../shinkai_message/shinkai_message_data';
import { ShinkaiVersion } from '../shinkai_message/shinkai_version';

export type ProfileName = string;
export type EncryptionStaticKey = Uint8Array;
export type EncryptionPublicKey = Uint8Array;
export type SignatureStaticKey = Uint8Array;
export type SignaturePublicKey = Uint8Array;

export class ShinkaiMessageBuilder {
  message_raw_content: string;
  message_content_schema: MessageSchemaType;
  internal_metadata?: InternalMetadata;
  external_metadata?: ExternalMetadata;
  encryption: TSEncryptionMethod;
  my_encryption_secret_key: EncryptionStaticKey;
  my_encryption_public_key: EncryptionPublicKey;
  my_signature_secret_key: SignatureStaticKey;
  my_signature_public_key: SignaturePublicKey;
  receiver_public_key: EncryptionPublicKey;
  version: ShinkaiVersion;
  optional_second_public_key_receiver_node?: EncryptionPublicKey;

  constructor(
    my_encryption_secret_key: Uint8Array,
    my_signature_secret_key: Uint8Array,
    receiver_public_key: Uint8Array,
  ) {
    this.version = ShinkaiVersion.V1_0;
    this.my_encryption_secret_key = my_encryption_secret_key;
    this.my_signature_secret_key = my_signature_secret_key;
    this.receiver_public_key = receiver_public_key;
    this.message_raw_content = '';
    this.message_content_schema = MessageSchemaType.Empty;
    this.encryption = TSEncryptionMethod.None;
    this.my_encryption_public_key = nacl.box.keyPair.fromSecretKey(
      this.my_encryption_secret_key,
    ).publicKey;
    this.my_signature_public_key = new Uint8Array();
  }

  async init(): Promise<this> {
    this.my_signature_public_key = await ed.getPublicKey(
      this.my_signature_secret_key,
    );
    return this;
  }

  set_body_encryption(encryption: TSEncryptionMethod): this {
    this.encryption = encryption;
    return this;
  }

  set_no_body_encryption(): this {
    this.encryption = TSEncryptionMethod.None;
    return this;
  }

  set_message_raw_content(message_raw_content: string): this {
    this.message_raw_content = message_raw_content;
    return this;
  }

  set_message_schema_type(content: MessageSchemaType): this {
    this.message_content_schema = content;
    return this;
  }

  set_internal_metadata(
    sender_subidentity: string,
    recipient_subidentity: string,
    encryption: TSEncryptionMethod,
  ): this {
    const signature = '';
    this.internal_metadata = {
      sender_subidentity,
      recipient_subidentity,
      inbox: '',
      signature,
      encryption,
    };
    return this;
  }

  set_internal_metadata_with_inbox(
    sender_subidentity: string,
    recipient_subidentity: string,
    inbox: string,
    encryption: TSEncryptionMethod,
  ): this {
    const signature = '';
    this.internal_metadata = {
      sender_subidentity,
      recipient_subidentity,
      inbox,
      signature,
      encryption,
    };
    return this;
  }

  set_internal_metadata_with_schema(
    sender_subidentity: string,
    recipient_subidentity: string,
    inbox: string,
    message_schema: MessageSchemaType,
    encryption: TSEncryptionMethod,
  ): this {
    const signature = '';
    this.message_content_schema = message_schema;
    this.internal_metadata = {
      sender_subidentity,
      recipient_subidentity,
      inbox,
      signature,
      encryption,
    };
    return this;
  }

  set_empty_encrypted_internal_metadata(): this {
    const signature = '';
    this.internal_metadata = {
      sender_subidentity: '',
      recipient_subidentity: '',
      inbox: '',
      signature,
      encryption: TSEncryptionMethod.DiffieHellmanChaChaPoly1305,
    };
    return this;
  }

  set_empty_non_encrypted_internal_metadata(): this {
    const signature = '';
    this.internal_metadata = {
      sender_subidentity: '',
      recipient_subidentity: '',
      inbox: '',
      signature,
      encryption: TSEncryptionMethod.None,
    };
    return this;
  }

  set_external_metadata(recipient: ProfileName, sender: ProfileName): this {
    const signature = '';
    const other = '';
    const intra_sender = '';
    const scheduled_time = new Date().toISOString();
    this.external_metadata = {
      sender,
      recipient,
      scheduled_time,
      signature,
      other,
      intra_sender,
    };
    return this;
  }

  set_external_metadata_with_other(
    recipient: ProfileName,
    sender: ProfileName,
    other: string,
  ): this {
    const signature = '';
    const intra_sender = '';
    const scheduled_time = new Date().toISOString();
    this.external_metadata = {
      sender,
      recipient,
      scheduled_time,
      signature,
      other,
      intra_sender,
    };
    return this;
  }

  set_external_metadata_with_other_and_intra_sender(
    recipient: ProfileName,
    sender: ProfileName,
    other: string,
    intra_sender: string,
  ): this {
    const signature = '';
    const scheduled_time = new Date().toISOString();
    this.external_metadata = {
      sender,
      recipient,
      scheduled_time,
      signature,
      other,
      intra_sender,
    };
    return this;
  }

  set_external_metadata_with_intra_sender(
    recipient: ProfileName,
    sender: ProfileName,
    intra_sender: string,
  ): this {
    const signature = '';
    const other = '';
    const scheduled_time = new Date().toISOString();
    this.external_metadata = {
      sender,
      recipient,
      scheduled_time,
      signature,
      other,
      intra_sender,
    };
    return this;
  }

  set_external_metadata_with_schedule(
    recipient: ProfileName,
    sender: ProfileName,
    scheduled_time: string,
  ): this {
    const signature = '';
    const other = '';
    const intra_sender = '';
    this.external_metadata = {
      sender,
      recipient,
      scheduled_time,
      signature,
      other,
      intra_sender,
    };
    return this;
  }

  set_external_metadata_with_schedule_and_other(
    recipient: ProfileName,
    sender: ProfileName,
    scheduled_time: string,
    other: string
  ): this {
    const signature = "";
    const intra_sender = "";
    this.external_metadata = {
      sender,
      recipient,
      scheduled_time,
      signature,
      other,
      intra_sender,
    };
    return this;
  }

  update_intra_sender(intra_sender: string): this {
    if (this.external_metadata) {
      this.external_metadata.intra_sender = intra_sender;
    }
    return this;
  }

  set_optional_second_public_key_receiver_node(
    optional_second_public_key_receiver_node: EncryptionPublicKey,
  ): this {
    this.optional_second_public_key_receiver_node =
      optional_second_public_key_receiver_node;
    return this;
  }

  clone(): ShinkaiMessageBuilder {
    const clone = Object.create(
      Object.getPrototypeOf(this),
      Object.getOwnPropertyDescriptors(this),
    );

    // Deep clone of Uint8Array properties
    clone.my_encryption_secret_key = new Uint8Array(
      this.my_encryption_secret_key,
    );
    clone.my_encryption_public_key = new Uint8Array(
      this.my_encryption_public_key,
    );
    clone.my_signature_secret_key = new Uint8Array(
      this.my_signature_secret_key,
    );
    clone.my_signature_public_key = new Uint8Array(
      this.my_signature_public_key,
    );
    clone.receiver_public_key = new Uint8Array(this.receiver_public_key);
    clone.optional_second_public_key_receiver_node = this
      .optional_second_public_key_receiver_node
      ? new Uint8Array(this.optional_second_public_key_receiver_node)
      : undefined;

    return clone;
  }

  async build(): Promise<ShinkaiMessage> {
    const newSelf = this.clone();

    // Validations
    if (!newSelf.internal_metadata) {
      throw new Error('Internal metadata is required');
    }

    if (!newSelf.external_metadata) {
      throw new Error('External metadata is required');
    }

    if (
      newSelf.encryption !== TSEncryptionMethod.None &&
      newSelf.internal_metadata &&
      newSelf.internal_metadata.encryption !== TSEncryptionMethod.None &&
      !newSelf.optional_second_public_key_receiver_node
    ) {
      throw new Error(
        'Encryption should not be set on both body and internal metadata simultaneously without optional_second_public_key_receiver_node.',
      );
    }

    // Fix inbox name if it's empty
    if (newSelf.internal_metadata && newSelf.internal_metadata.inbox === '') {
      if (newSelf.external_metadata) {
        // Generate a new inbox name
        const newInboxName = InboxName.getRegularInboxNameFromParams(
          newSelf.external_metadata.sender,
          newSelf.internal_metadata.sender_subidentity,
          newSelf.external_metadata.recipient,
          newSelf.internal_metadata.recipient_subidentity,
          newSelf.internal_metadata.encryption !== TSEncryptionMethod.None,
        );

        if (typeof newInboxName === 'string') {
          throw new Error('Failed to generate inbox name');
        }

        // Update the inbox name in the internal metadata
        newSelf.internal_metadata.inbox = newInboxName.value;
      } else {
        throw new Error('Inbox is required');
      }
    }

    // encrypted body or data if necessary
    if (newSelf.internal_metadata) {
      const data: ShinkaiData = {
        message_raw_content: newSelf.message_raw_content,
        message_content_schema: newSelf.message_content_schema,
      };

      let shinkaiBody: ShinkaiBody;
      if (newSelf.internal_metadata.encryption !== TSEncryptionMethod.None) {
        const encryptedData = await ShinkaiBody.createAndEncryptMessageData(
          data,
          newSelf.internal_metadata,
          newSelf.my_encryption_secret_key,
          newSelf.receiver_public_key,
        );

        shinkaiBody = await encryptedData.sign_inner_layer(
          newSelf.my_signature_secret_key,
        );
      } else {
        // If encryption method is None, just return body
        const newMessageData = new UnencryptedMessageData(data);
        shinkaiBody = new ShinkaiBody(
          newMessageData,
          newSelf.internal_metadata,
        );
        shinkaiBody = await shinkaiBody.sign_inner_layer(
          newSelf.my_signature_secret_key,
        );
      }

      // if self.encryption is not None
      let newBody: MessageBody;
      if (newSelf.encryption !== TSEncryptionMethod.None) {
        const secondPublicKey =
          newSelf.optional_second_public_key_receiver_node ||
          newSelf.receiver_public_key;

        const messageBody = new UnencryptedMessageBody(shinkaiBody);
        newBody = await messageBody.encrypt(
          newSelf.my_encryption_secret_key,
          secondPublicKey,
        );
      } else {
        // If encryption method is None, just return body
        newBody = new UnencryptedMessageBody(shinkaiBody);
      }

      let signedMsg = new ShinkaiMessage(
        newBody,
        newSelf.external_metadata,
        newSelf.encryption,
        newSelf.version,
      );
      signedMsg = await signedMsg.sign_outer_layer(
        newSelf.my_signature_secret_key,
      );
      return signedMsg;
    } else {
      throw new Error('Missing fields');
    }
  }

  public static ackMessage(
    my_encryption_secret_key: EncryptionStaticKey,
    my_signature_secret_key: SignatureStaticKey,
    receiver_public_key: EncryptionPublicKey,
    sender: ProfileName,
    receiver: ProfileName,
  ): Promise<ShinkaiMessage> {
    return new ShinkaiMessageBuilder(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    )
      .set_message_raw_content('ACK')
      .set_internal_metadata('', '', TSEncryptionMethod.None)
      .set_no_body_encryption()
      .set_external_metadata_with_intra_sender(receiver, sender, '')
      .build();
  }

  public static async jobCreation(
    scope: JobScope,
    my_encryption_secret_key: EncryptionStaticKey,
    my_signature_secret_key: SignatureStaticKey,
    receiver_public_key: EncryptionPublicKey,
    sender: ProfileName,
    sender_subidentity: string,
    node_receiver: ProfileName,
    node_receiver_subidentity: string,
  ): Promise<ShinkaiMessage> {
    const jobCreation = { scope };
    const body = JSON.stringify(jobCreation);

    return new ShinkaiMessageBuilder(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    )
      .set_message_raw_content(body)
      .set_internal_metadata(
        sender_subidentity,
        node_receiver_subidentity,
        TSEncryptionMethod.None,
      )
      .set_message_schema_type(MessageSchemaType.JobCreationSchema)
      .set_body_encryption(TSEncryptionMethod.None)
      .set_external_metadata_with_intra_sender(
        node_receiver,
        sender,
        sender_subidentity,
      )
      .build();
  }

  public static async jobMessage(
    job_id: string,
    content: string,
    files_inbox: string,
    my_encryption_secret_key: EncryptionStaticKey,
    my_signature_secret_key: SignatureStaticKey,
    receiver_public_key: EncryptionPublicKey,
    node_sender: ProfileName,
    sender_subidentity: string,
    node_receiver: ProfileName,
    node_receiver_subidentity: string,
  ): Promise<ShinkaiMessage> {
    const jobMessage = { job_id, content, files_inbox };
    const body = JSON.stringify(jobMessage);
    const inbox = InboxName.getJobInboxNameFromParams(job_id).value;

    return new ShinkaiMessageBuilder(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    )
      .set_message_raw_content(body)
      .set_internal_metadata_with_inbox(
        sender_subidentity,
        node_receiver_subidentity,
        inbox,
        TSEncryptionMethod.None,
      )
      .set_message_schema_type(MessageSchemaType.JobMessageSchema)
      .set_body_encryption(TSEncryptionMethod.None)
      .set_external_metadata_with_intra_sender(
        node_receiver,
        node_sender,
        sender_subidentity,
      )
      .build();
  }

  public static async jobMessageFromAgent(
    job_id: string,
    content: string,
    my_signature_secret_key: SignatureStaticKey,
    node_sender: ProfileName,
    node_receiver: ProfileName,
  ): Promise<ShinkaiMessage> {
    const jobMessage = { job_id, content, files_inbox: '' };
    const body = JSON.stringify(jobMessage);

    const inbox = InboxName.getJobInboxNameFromParams(job_id).value;

    // Use for placeholder. These messages *are not* encrypted so it's not required
    const placeholder_encryption_sk = new Uint8Array(32); // Assuming 32 bytes for the key
    const placeholder_encryption_pk = new Uint8Array(32); // Assuming 32 bytes for the key

    return new ShinkaiMessageBuilder(
      placeholder_encryption_sk,
      my_signature_secret_key,
      placeholder_encryption_pk,
    )
      .set_message_raw_content(body)
      .set_internal_metadata_with_schema(
        '',
        '',
        inbox,
        MessageSchemaType.JobMessageSchema,
        TSEncryptionMethod.None,
      )
      .set_no_body_encryption()
      .set_external_metadata_with_intra_sender(node_receiver, node_sender, '')
      .build();
  }

  public static terminateMessage(
    my_encryption_secret_key: EncryptionStaticKey,
    my_signature_secret_key: SignatureStaticKey,
    receiver_public_key: EncryptionPublicKey,
    sender: ProfileName,
    receiver: ProfileName,
  ): Promise<ShinkaiMessage> {
    return new ShinkaiMessageBuilder(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    )
      .set_message_raw_content('terminate')
      .set_internal_metadata('', '', TSEncryptionMethod.None)
      .set_no_body_encryption()
      .set_external_metadata_with_intra_sender(receiver, sender, '')
      .build();
  }

  public static async createCustomShinkaiMessageToNode<T>(
    my_subidentity_encryption_sk: EncryptionStaticKey,
    my_subidentity_signature_sk: SignatureStaticKey,
    receiver_public_key: EncryptionPublicKey,
    data: T,
    sender_subidentity: string,
    sender: ProfileName,
    receiver: ProfileName,
    schema: MessageSchemaType,
  ): Promise<ShinkaiMessage> {
    const body = JSON.stringify(data);

    // Convert encryption public key to string
    const my_subidentity_encryption_pk = nacl.box.keyPair.fromSecretKey(
      my_subidentity_encryption_sk,
    ).publicKey;
    const other = Array.from(my_subidentity_encryption_pk)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');

    const builder = new ShinkaiMessageBuilder(
      my_subidentity_encryption_sk,
      my_subidentity_signature_sk,
      receiver_public_key,
    );
    await builder.init();
    return builder.set_message_raw_content(body)
      .set_body_encryption(TSEncryptionMethod.DiffieHellmanChaChaPoly1305)
      .set_internal_metadata_with_schema(
        sender_subidentity,
        '',
        '',
        schema,
        TSEncryptionMethod.None,
      )
      .set_external_metadata_with_other(receiver, sender, other)
      .build();
  }

  public static async useCodeRegistrationForProfile(
    profile_encryption_sk: EncryptionStaticKey,
    profile_signature_sk: SignatureStaticKey,
    receiver_public_key: EncryptionPublicKey,
    code: string,
    identity_type: string,
    permission_type: string,
    registration_name: string,
    sender_subidentity: string,
    sender: ProfileName,
    receiver: ProfileName,
  ): Promise<ShinkaiMessage> {
    const profile_signature_pk = await ed.getPublicKey(profile_signature_sk);
    const profile_encryption_pk = nacl.box.keyPair.fromSecretKey(
      profile_encryption_sk,
    ).publicKey;

    const registration_code = {
      code,
      registration_name,
      device_identity_pk: '',
      device_encryption_pk: '',
      profile_identity_pk: Array.from(profile_signature_pk)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join(''),
      profile_encryption_pk: Array.from(profile_encryption_pk)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join(''),
      identity_type,
      permission_type,
    };

    return ShinkaiMessageBuilder.createCustomShinkaiMessageToNode(
      profile_encryption_sk,
      profile_signature_sk,
      receiver_public_key,
      registration_code,
      sender_subidentity,
      sender,
      receiver,
      MessageSchemaType.UseRegistrationCode,
    );
  }

  public static async useCodeRegistrationForDevice(
    my_device_encryption_sk: EncryptionStaticKey,
    my_device_signature_sk: SignatureStaticKey,
    profile_encryption_sk: EncryptionStaticKey,
    profile_signature_sk: SignatureStaticKey,
    receiver_public_key: EncryptionPublicKey,
    code: string,
    identity_type: string,
    permission_type: string,
    registration_name: string,
    sender_subidentity: string,
    sender: ProfileName,
    receiver: ProfileName,
  ): Promise<ShinkaiMessage> {
    const my_device_signature_pk = await ed.getPublicKey(
      my_device_signature_sk,
    );
    const my_device_encryption_pk = nacl.box.keyPair.fromSecretKey(
      my_device_encryption_sk,
    ).publicKey;
    const profile_signature_pk = await ed.getPublicKey(profile_signature_sk);
    const profile_encryption_pk = nacl.box.keyPair.fromSecretKey(
      profile_encryption_sk,
    ).publicKey;
    const other = Array.from(my_device_encryption_pk)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');

    const registration_code = {
      code,
      registration_name,
      device_identity_pk: Array.from(my_device_signature_pk)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join(''),
      device_encryption_pk: other,
      profile_identity_pk: Array.from(profile_signature_pk)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join(''),
      profile_encryption_pk: Array.from(profile_encryption_pk)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join(''),
      identity_type,
      permission_type,
    };

    return ShinkaiMessageBuilder.createCustomShinkaiMessageToNode(
      my_device_encryption_sk,
      my_device_signature_sk,
      receiver_public_key,
      registration_code,
      sender_subidentity,
      sender,
      receiver,
      MessageSchemaType.UseRegistrationCode,
    );
  }

  public static async initialRegistrationWithNoCodeForDevice(
    my_device_encryption_sk: EncryptionStaticKey,
    my_device_signature_sk: SignatureStaticKey,
    profile_encryption_sk: EncryptionStaticKey,
    profile_signature_sk: SignatureStaticKey,
    registration_name: string,
    sender_subidentity: string,
    sender: ProfileName,
    receiver: ProfileName,
  ): Promise<ShinkaiMessage> {
    const my_device_signature_pk = await ed.getPublicKey(
      my_device_signature_sk,
    );
    const my_device_encryption_pk = nacl.box.keyPair.fromSecretKey(
      my_device_encryption_sk,
    ).publicKey;
    const profile_signature_pk = await ed.getPublicKey(profile_signature_sk);
    const profile_encryption_pk = nacl.box.keyPair.fromSecretKey(
      profile_encryption_sk,
    ).publicKey;
    const other = Array.from(my_device_encryption_pk)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');

    const identity_type = 'device';
    const permission_type = 'admin';

    const registration_code = {
      code: '',
      registration_name,
      device_identity_pk: Array.from(my_device_signature_pk)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join(''),
      device_encryption_pk: other,
      profile_identity_pk: Array.from(profile_signature_pk)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join(''),
      profile_encryption_pk: Array.from(profile_encryption_pk)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join(''),
      identity_type,
      permission_type,
    };

    const body = JSON.stringify(registration_code);

    return new ShinkaiMessageBuilder(
      my_device_encryption_sk,
      my_device_signature_sk,
      my_device_encryption_pk,
    )
      .set_message_raw_content(body)
      .set_body_encryption(TSEncryptionMethod.None)
      .set_internal_metadata_with_schema(
        sender_subidentity,
        '',
        '',
        MessageSchemaType.UseRegistrationCode,
        TSEncryptionMethod.None,
      )
      .set_external_metadata_with_other(receiver, sender, other)
      .build();
  }

  public static async createFilesInboxWithSymKey(
    my_subidentity_encryption_sk: EncryptionStaticKey,
    my_subidentity_signature_sk: SignatureStaticKey,
    receiver_public_key: EncryptionPublicKey,
    inbox: string,
    symmetric_key_sk: string,
    sender_subidentity: string,
    sender: ProfileName,
    receiver: ProfileName,
  ): Promise<ShinkaiMessage> {
    return new ShinkaiMessageBuilder(
      my_subidentity_encryption_sk,
      my_subidentity_signature_sk,
      receiver_public_key,
    )
      .set_message_raw_content(symmetric_key_sk)
      .set_body_encryption(TSEncryptionMethod.DiffieHellmanChaChaPoly1305)
      .set_internal_metadata_with_schema(
        sender_subidentity,
        '',
        inbox,
        MessageSchemaType.SymmetricKeyExchange,
        TSEncryptionMethod.None,
      )
      .set_external_metadata_with_intra_sender(
        receiver,
        sender,
        sender_subidentity,
      )
      .build();
  }

  public static async getAllInboxesForProfile(
    my_subidentity_encryption_sk: EncryptionStaticKey,
    my_subidentity_signature_sk: SignatureStaticKey,
    receiver_public_key: EncryptionPublicKey,
    full_profile: string,
    sender_subidentity: string,
    sender: ProfileName,
    receiver: ProfileName,
  ): Promise<ShinkaiMessage> {
    const builder = new ShinkaiMessageBuilder(
      my_subidentity_encryption_sk,
      my_subidentity_signature_sk,
      receiver_public_key,
    );
    await builder.init();
    return builder
      .set_message_raw_content(full_profile)
      .set_internal_metadata_with_schema(
        sender_subidentity,
        '',
        '',
        MessageSchemaType.TextContent,
        TSEncryptionMethod.None,
      )
      .set_body_encryption(TSEncryptionMethod.DiffieHellmanChaChaPoly1305)
      .set_external_metadata_with_intra_sender(
        receiver,
        sender,
        sender_subidentity,
      )
      .build();
  }

  public static async getLastMessagesFromInbox(
    my_subidentity_encryption_sk: EncryptionStaticKey,
    my_subidentity_signature_sk: SignatureStaticKey,
    receiver_public_key: EncryptionPublicKey,
    inbox: string,
    count: number,
    offset: string | null,
    sender_subidentity: string,
    sender: ProfileName,
    receiver: ProfileName,
  ): Promise<ShinkaiMessage> {
    const getLastMessagesFromInbox = {
      inbox,
      count,
      offset,
    };

    return ShinkaiMessageBuilder.createCustomShinkaiMessageToNode(
      my_subidentity_encryption_sk,
      my_subidentity_signature_sk,
      receiver_public_key,
      getLastMessagesFromInbox,
      sender_subidentity,
      sender,
      receiver,
      MessageSchemaType.APIGetMessagesFromInboxRequest,
    );
  }

  public static async getLastUnreadMessagesFromInbox(
    my_subidentity_encryption_sk: EncryptionStaticKey,
    my_subidentity_signature_sk: SignatureStaticKey,
    receiver_public_key: EncryptionPublicKey,
    inbox: string,
    count: number,
    offset: string | null,
    sender_subidentity: string,
    sender: ProfileName,
    receiver: ProfileName,
  ): Promise<ShinkaiMessage> {
    const getLastUnreadMessagesFromInbox = {
      inbox,
      count,
      offset,
    };

    return ShinkaiMessageBuilder.createCustomShinkaiMessageToNode(
      my_subidentity_encryption_sk,
      my_subidentity_signature_sk,
      receiver_public_key,
      getLastUnreadMessagesFromInbox,
      sender_subidentity,
      sender,
      receiver,
      MessageSchemaType.APIGetMessagesFromInboxRequest,
    );
  }

  public static async requestAddAgent(
    my_subidentity_encryption_sk: EncryptionStaticKey,
    my_subidentity_signature_sk: SignatureStaticKey,
    receiver_public_key: EncryptionPublicKey,
    agent: SerializedAgent,
    sender_subidentity: string,
    sender: ProfileName,
    receiver: ProfileName,
  ): Promise<ShinkaiMessage> {
    const addAgent = { agent };

    return ShinkaiMessageBuilder.createCustomShinkaiMessageToNode(
      my_subidentity_encryption_sk,
      my_subidentity_signature_sk,
      receiver_public_key,
      addAgent,
      sender_subidentity,
      sender,
      receiver,
      MessageSchemaType.APIAddAgentRequest,
    );
  }

  public static async readUpToTime(
    my_subidentity_encryption_sk: EncryptionStaticKey,
    my_subidentity_signature_sk: SignatureStaticKey,
    receiver_public_key: EncryptionPublicKey,
    inbox: string,
    upToTime: string,
    sender_subidentity: string,
    sender: ProfileName,
    receiver: ProfileName,
  ): Promise<ShinkaiMessage> {
    const readUpToTime = { inbox, upToTime };

    return ShinkaiMessageBuilder.createCustomShinkaiMessageToNode(
      my_subidentity_encryption_sk,
      my_subidentity_signature_sk,
      receiver_public_key,
      readUpToTime,
      sender_subidentity,
      sender,
      receiver,
      MessageSchemaType.APIReadUpToTimeRequest,
    );
  }

  public static async errorMessage(
    my_encryption_secret_key: EncryptionStaticKey,
    my_signature_secret_key: SignatureStaticKey,
    receiver_public_key: EncryptionPublicKey,
    sender: ProfileName,
    receiver: ProfileName,
    error_msg: string,
  ): Promise<ShinkaiMessage> {
    return new ShinkaiMessageBuilder(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    )
      .set_message_raw_content(`{error: "${error_msg}"}`)
      .set_empty_encrypted_internal_metadata()
      .set_external_metadata(receiver, sender)
      .set_no_body_encryption()
      .build();
  }

  public static async requestCodeRegistration(
    my_subidentity_encryption_sk: EncryptionStaticKey,
    my_subidentity_signature_sk: SignatureStaticKey,
    receiver_public_key: EncryptionPublicKey,
    permissions: string,
    code_type: string,
    sender_subidentity: string,
    sender: ProfileName,
    receiver: ProfileName,
  ): Promise<ShinkaiMessage> {
    const payload = {
      permissions,
      code_type,
    };
    const data = JSON.stringify(payload);
    return ShinkaiMessageBuilder.createCustomShinkaiMessageToNode(
      my_subidentity_encryption_sk,
      my_subidentity_signature_sk,
      receiver_public_key,
      data,
      sender_subidentity,
      sender,
      receiver,
      MessageSchemaType.CreateRegistrationCode,
    );
  }

  public static async updateInboxName(
    my_subidentity_encryption_sk: EncryptionStaticKey,
    my_subidentity_signature_sk: SignatureStaticKey,
    receiver_public_key: EncryptionPublicKey,
    sender: ProfileName,
    sender_subidentity: string,
    receiver: ProfileName,
    receiver_subidentity: string,
    inbox: string,
    inbox_name: string,
  ): Promise<ShinkaiMessage> {
    return new ShinkaiMessageBuilder(
      my_subidentity_encryption_sk,
      my_subidentity_signature_sk,
      receiver_public_key,
    )
      .set_message_raw_content(inbox_name)
      .set_message_schema_type(MessageSchemaType.TextContent)
      .set_body_encryption(TSEncryptionMethod.DiffieHellmanChaChaPoly1305)
      .set_internal_metadata_with_inbox(
        sender_subidentity,
        receiver_subidentity,
        inbox,
        TSEncryptionMethod.None,
      )
      .set_external_metadata_with_intra_sender(
        receiver,
        sender,
        sender_subidentity,
      )
      .set_body_encryption(TSEncryptionMethod.DiffieHellmanChaChaPoly1305)
      .build();
  }

  public static async sendTextMessageWithInbox(
    my_subidentity_encryption_sk: EncryptionStaticKey,
    my_subidentity_signature_sk: SignatureStaticKey,
    receiver_public_key: EncryptionPublicKey,
    sender: ProfileName,
    sender_subidentity: string,
    receiver: ProfileName,
    receiver_subidentity: string,
    inbox: string,
    text_message: string,
  ): Promise<ShinkaiMessage> {
    return new ShinkaiMessageBuilder(
      my_subidentity_encryption_sk,
      my_subidentity_signature_sk,
      receiver_public_key,
    )
      .set_message_raw_content(text_message)
      .set_message_schema_type(MessageSchemaType.TextContent)
      .set_body_encryption(TSEncryptionMethod.DiffieHellmanChaChaPoly1305)
      .set_internal_metadata_with_inbox(
        sender_subidentity,
        receiver_subidentity,
        inbox,
        TSEncryptionMethod.None,
      )
      .set_external_metadata_with_intra_sender(
        receiver,
        sender,
        sender_subidentity,
      )
      .set_body_encryption(TSEncryptionMethod.DiffieHellmanChaChaPoly1305)
      .build();
  }

  public static async send_create_files_inbox_with_sym_key(
    my_subidentity_encryption_sk: EncryptionStaticKey,
    my_subidentity_signature_sk: SignatureStaticKey,
    receiver_public_key: EncryptionPublicKey,
    inbox: string,
    symmetric_key_sk: string,
    sender: ProfileName,
    sender_subidentity: string,
    receiver: ProfileName,
  ): Promise<ShinkaiMessage> {
    return new ShinkaiMessageBuilder(
      my_subidentity_encryption_sk,
      my_subidentity_signature_sk,
      receiver_public_key,
    )
      .set_message_raw_content(symmetric_key_sk)
      .set_message_schema_type(MessageSchemaType.SymmetricKeyExchange)
      .set_internal_metadata_with_inbox(
        sender_subidentity,
        '',
        inbox,
        TSEncryptionMethod.None,
      )
      .set_external_metadata_with_intra_sender(
        receiver,
        sender,
        sender_subidentity,
      )
      .set_body_encryption(TSEncryptionMethod.DiffieHellmanChaChaPoly1305)
      .build();
  }
}
