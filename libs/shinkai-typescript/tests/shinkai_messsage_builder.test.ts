import {
  generateEncryptionKeys,
  generateSignatureKeys,
} from '../src/cryptography/shinkai_encryption';
import {
  JobScope,
  MessageSchemaType,
  SerializedAgent,
  TSEncryptionMethod,
} from '../src/schemas/schema_types';
import {
  EncryptedMessageBody,
  UnencryptedMessageBody,
} from '../src/shinkai_message/shinkai_message_body';
import {
  EncryptedMessageData,
  UnencryptedMessageData,
} from '../src/shinkai_message/shinkai_message_data';
import { ShinkaiMessageBuilder } from '../src/shinkai_message_builder/shinkai_message_builder';

describe('ShinkaiMessageBuilder pre-made methods', () => {
  it('should create an ACK message', async () => {
    const encryptionKeys = await generateEncryptionKeys();
    const signatureKeys = await generateSignatureKeys();

    const my_encryption_secret_key = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_sk_string, 'hex'),
    );
    const my_signature_secret_key = new Uint8Array(
      Buffer.from(signatureKeys.my_identity_sk_string, 'hex'),
    );
    const receiver_public_key = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_pk_string, 'hex'),
    );
    const sender = '@@sender.shinkai';
    const receiver = '@@receiver.shinkai';

    const message = await ShinkaiMessageBuilder.ackMessage(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
      sender,
      receiver,
    );

    if (message.body instanceof UnencryptedMessageBody) {
      const messageData = message.body.unencrypted
        .message_data as UnencryptedMessageData;
      if ('message_raw_content' in messageData.data) {
        expect(messageData.data.message_raw_content).toBe('ACK');
      } else {
        throw new Error('Message data is not unencrypted');
      }
    } else {
      throw new Error('Message body is not unencrypted');
    }
    expect(message.external_metadata.sender).toBe(sender);
    expect(message.external_metadata.recipient).toBe(receiver);
  });

  it('should create a TERMINATE message', async () => {
    const encryptionKeys = await generateEncryptionKeys();
    const signatureKeys = await generateSignatureKeys();

    const my_encryption_secret_key = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_sk_string, 'hex'),
    );
    const my_signature_secret_key = new Uint8Array(
      Buffer.from(signatureKeys.my_identity_sk_string, 'hex'),
    );
    const receiver_public_key = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_pk_string, 'hex'),
    );
    const sender = '@@sender.shinkai';
    const receiver = '@@receiver.shinkai';

    const message = await ShinkaiMessageBuilder.terminateMessage(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
      sender,
      receiver,
    );

    if (message.body instanceof UnencryptedMessageBody) {
      const messageData = message.body.unencrypted
        .message_data as UnencryptedMessageData;
      if ('message_raw_content' in messageData.data) {
        expect(messageData.data.message_raw_content).toBe('terminate');
      } else {
        throw new Error('Message data is not unencrypted');
      }
    } else {
      throw new Error('Message body is not unencrypted');
    }
    expect(message.external_metadata.sender).toBe(sender);
    expect(message.external_metadata.recipient).toBe(receiver);
  });

  it('should create a Job Creation message', async () => {
    const encryptionKeys = await generateEncryptionKeys();
    const signatureKeys = await generateSignatureKeys();

    const my_encryption_secret_key = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_sk_string, 'hex'),
    );
    const my_signature_secret_key = new Uint8Array(
      Buffer.from(signatureKeys.my_identity_sk_string, 'hex'),
    );
    const receiver_public_key = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_pk_string, 'hex'),
    );
    const sender = '@@sender.shinkai';
    const receiver = '@@receiver.shinkai';
    const sender_subidentity = 'sender_subidentity';
    const node_receiver_subidentity = 'node_receiver_subidentity';
    const scope: JobScope = {
      buckets: ['bucket1', 'bucket2'],
      documents: ['document1', 'document2'],
    };

    const message = await ShinkaiMessageBuilder.jobCreation(
      scope,
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
      sender,
      sender_subidentity,
      receiver,
      node_receiver_subidentity,
    );

    // Check if the message body is an instance of EncryptedMessageBody
    if (message.body instanceof EncryptedMessageBody) {
      // You can add your assertions here related to the encrypted message
      // For example, you might want to check if the content is not empty
      expect(message.body.encrypted.content).not.toBe('');
    } else {
      throw new Error('Message body is not encrypted');
    }

    expect(message.external_metadata.sender).toBe(sender);
    expect(message.external_metadata.recipient).toBe(receiver);
  });

  it('should create a custom Shinkai message to node', async () => {
    const encryptionKeys = await generateEncryptionKeys();
    const signatureKeys = await generateSignatureKeys();

    const my_encryption_secret_key = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_sk_string, 'hex'),
    );
    const my_signature_secret_key = new Uint8Array(
      Buffer.from(signatureKeys.my_identity_sk_string, 'hex'),
    );
    const receiver_public_key = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_pk_string, 'hex'),
    );
    const sender = '@@sender.shinkai';
    const receiver = '@@receiver.shinkai';
    const sender_subidentity = 'sender_subidentity';
    const data = {
      key1: 'value1',
      key2: 'value2',
    };

    const message =
      await ShinkaiMessageBuilder.createCustomShinkaiMessageToNode(
        my_encryption_secret_key,
        my_signature_secret_key,
        receiver_public_key,
        data,
        sender_subidentity,
        sender,
        receiver,
        MessageSchemaType.TextContent,
      );

    // Check if the message body is an instance of EncryptedMessageBody
    if (message.body instanceof EncryptedMessageBody) {
      // You can add your assertions here related to the encrypted message
      // For example, you might want to check if the content is not empty
      expect(message.body.encrypted.content).not.toBe('');
    } else {
      throw new Error('Message body is not encrypted');
    }

    expect(message.external_metadata.sender).toBe(sender);
    expect(message.external_metadata.recipient).toBe(receiver);
  });

  it('should create a custom Shinkai message for profile registration', async () => {
    const encryptionKeys = await generateEncryptionKeys();
    const signatureKeys = await generateSignatureKeys();

    const profile_encryption_sk = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_sk_string, 'hex'),
    );
    const profile_signature_sk = new Uint8Array(
      Buffer.from(signatureKeys.my_identity_sk_string, 'hex'),
    );
    const receiver_public_key = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_pk_string, 'hex'),
    );
    const sender = '@@sender.shinkai';
    const receiver = '@@receiver.shinkai';
    const sender_subidentity = 'sender_subidentity';
    const code = 'registration_code';
    const identity_type = 'identity_type';
    const permission_type = 'permission_type';
    const registration_name = 'registration_name';

    const message = await ShinkaiMessageBuilder.useCodeRegistrationForProfile(
      profile_encryption_sk,
      profile_signature_sk,
      receiver_public_key,
      code,
      identity_type,
      permission_type,
      registration_name,
      sender_subidentity,
      sender,
      receiver,
    );

    // Check if the message body is an instance of EncryptedMessageBody
    if (message.body instanceof EncryptedMessageBody) {
      // You can add your assertions here related to the encrypted message
      // For example, you might want to check if the content is not empty
      expect(message.body.encrypted.content).not.toBe('');
    } else {
      throw new Error('Message body is not encrypted');
    }

    expect(message.external_metadata.sender).toBe(sender);
    expect(message.external_metadata.recipient).toBe(receiver);
  });

  it('should create a custom Shinkai message for device registration', async () => {
    const encryptionKeys = await generateEncryptionKeys();
    const signatureKeys = await generateSignatureKeys();

    const my_device_encryption_sk = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_sk_string, 'hex'),
    );
    const my_device_signature_sk = new Uint8Array(
      Buffer.from(signatureKeys.my_identity_sk_string, 'hex'),
    );
    const profile_encryption_sk = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_sk_string, 'hex'),
    );
    const profile_signature_sk = new Uint8Array(
      Buffer.from(signatureKeys.my_identity_sk_string, 'hex'),
    );
    const receiver_public_key = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_pk_string, 'hex'),
    );
    const sender = '@@sender.shinkai';
    const receiver = '@@receiver.shinkai';
    const sender_subidentity = 'sender_subidentity';
    const code = 'registration_code';
    const identity_type = 'identity_type';
    const permission_type = 'permission_type';
    const registration_name = 'registration_name';

    const message = await ShinkaiMessageBuilder.useCodeRegistrationForDevice(
      my_device_encryption_sk,
      my_device_signature_sk,
      profile_encryption_sk,
      profile_signature_sk,
      receiver_public_key,
      code,
      identity_type,
      permission_type,
      registration_name,
      sender_subidentity,
      sender,
      receiver,
    );

    // Check if the message body is an instance of EncryptedMessageBody
    if (message.body instanceof EncryptedMessageBody) {
      // You can add your assertions here related to the encrypted message
      // For example, you might want to check if the content is not empty
      expect(message.body.encrypted.content).not.toBe('');
    } else {
      throw new Error('Message body is not encrypted');
    }

    expect(message.external_metadata.sender).toBe(sender);
    expect(message.external_metadata.recipient).toBe(receiver);
  });

  it('should create an initial registration message with no code for device', async () => {
    const encryptionKeys = await generateEncryptionKeys();
    const signatureKeys = await generateSignatureKeys();

    const my_device_encryption_sk = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_sk_string, 'hex'),
    );
    const my_device_signature_sk = new Uint8Array(
      Buffer.from(signatureKeys.my_identity_sk_string, 'hex'),
    );
    const profile_encryption_sk = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_sk_string, 'hex'),
    );
    const profile_signature_sk = new Uint8Array(
      Buffer.from(signatureKeys.my_identity_sk_string, 'hex'),
    );
    const sender = '@@sender.shinkai';
    const receiver = '@@receiver.shinkai';
    const sender_subidentity = 'sender_subidentity';
    const registration_name = 'registration_name';

    const message =
      await ShinkaiMessageBuilder.initialRegistrationWithNoCodeForDevice(
        my_device_encryption_sk,
        my_device_signature_sk,
        profile_encryption_sk,
        profile_signature_sk,
        registration_name,
        sender_subidentity,
        sender,
        receiver,
      );

    // Check if the message body is an instance of UnencryptedMessageBody
    if (message.body instanceof UnencryptedMessageBody) {
      // You can add your assertions here related to the unencrypted message
      // For example, you might want to check if the content is not empty
      expect(message.body.unencrypted).not.toBeUndefined();
    } else {
      throw new Error('Message body is not unencrypted');
    }

    expect(message.external_metadata.sender).toBe(sender);
    expect(message.external_metadata.recipient).toBe(receiver);
  });

  it('should create a files inbox with symmetric key', async () => {
    const encryptionKeys = await generateEncryptionKeys();
    const signatureKeys = await generateSignatureKeys();

    const my_subidentity_encryption_sk = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_sk_string, 'hex'),
    );
    const my_subidentity_signature_sk = new Uint8Array(
      Buffer.from(signatureKeys.my_identity_sk_string, 'hex'),
    );
    const receiver_public_key = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_pk_string, 'hex'),
    );
    const sender = '@@sender.shinkai';
    const receiver = '@@receiver.shinkai';
    const sender_subidentity = 'sender_subidentity';
    const inbox = 'inbox_name';
    const symmetric_key_sk = 'symmetric_key';

    const message = await ShinkaiMessageBuilder.createFilesInboxWithSymKey(
      my_subidentity_encryption_sk,
      my_subidentity_signature_sk,
      receiver_public_key,
      inbox,
      symmetric_key_sk,
      sender_subidentity,
      sender,
      receiver,
    );

    // Check if the message body is an instance of EncryptedMessageBody
    if (message.body instanceof EncryptedMessageBody) {
      // You can add your assertions here related to the encrypted message
      // For example, you might want to check if the content is not empty
      expect(message.body.encrypted.content).not.toBe('');
    } else {
      throw new Error('Message body is not encrypted');
    }

    expect(message.external_metadata.sender).toBe(sender);
    expect(message.external_metadata.recipient).toBe(receiver);
  });

  it('should get all inboxes for profile', async () => {
    const encryptionKeys = await generateEncryptionKeys();
    const signatureKeys = await generateSignatureKeys();

    const my_subidentity_encryption_sk = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_sk_string, 'hex'),
    );
    const my_subidentity_signature_sk = new Uint8Array(
      Buffer.from(signatureKeys.my_identity_sk_string, 'hex'),
    );
    const receiver_public_key = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_pk_string, 'hex'),
    );
    const sender = '@@sender.shinkai';
    const receiver = '@@receiver.shinkai';
    const sender_subidentity = 'sender_subidentity';
    const full_profile = 'full_profile';

    const message = await ShinkaiMessageBuilder.getAllInboxesForProfile(
      my_subidentity_encryption_sk,
      my_subidentity_signature_sk,
      receiver_public_key,
      full_profile,
      sender_subidentity,
      sender,
      receiver,
    );

    // Check if the message body is an instance of EncryptedMessageBody
    if (message.body instanceof EncryptedMessageBody) {
      // You can add your assertions here related to the encrypted message
      // For example, you might want to check if the content is not empty
      expect(message.body.encrypted.content).not.toBe('');
    } else {
      throw new Error('Message body is not encrypted');
    }

    expect(message.external_metadata.sender).toBe(sender);
    expect(message.external_metadata.recipient).toBe(receiver);
  });

  it('should get last messages from inbox', async () => {
    const encryptionKeys = await generateEncryptionKeys();
    const signatureKeys = await generateSignatureKeys();

    const my_subidentity_encryption_sk = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_sk_string, 'hex'),
    );
    const my_subidentity_signature_sk = new Uint8Array(
      Buffer.from(signatureKeys.my_identity_sk_string, 'hex'),
    );
    const receiver_public_key = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_pk_string, 'hex'),
    );
    const sender = '@@sender.shinkai';
    const receiver = '@@receiver.shinkai';
    const sender_subidentity = 'sender_subidentity';
    const inbox = 'inbox_name';
    const count = 10;
    const offset = null;

    const message = await ShinkaiMessageBuilder.getLastMessagesFromInbox(
      my_subidentity_encryption_sk,
      my_subidentity_signature_sk,
      receiver_public_key,
      inbox,
      count,
      offset,
      sender_subidentity,
      sender,
      receiver,
    );

    // Check if the message body is an instance of EncryptedMessageBody
    if (message.body instanceof EncryptedMessageBody) {
      // You can add your assertions here related to the encrypted message
      // For example, you might want to check if the content is not empty
      expect(message.body.encrypted.content).not.toBe('');
    } else {
      throw new Error('Message body is not encrypted');
    }

    expect(message.external_metadata.sender).toBe(sender);
    expect(message.external_metadata.recipient).toBe(receiver);
  });

  it('should get last unread messages from inbox', async () => {
    const encryptionKeys = await generateEncryptionKeys();
    const signatureKeys = await generateSignatureKeys();

    const my_subidentity_encryption_sk = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_sk_string, 'hex'),
    );
    const my_subidentity_signature_sk = new Uint8Array(
      Buffer.from(signatureKeys.my_identity_sk_string, 'hex'),
    );
    const receiver_public_key = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_pk_string, 'hex'),
    );
    const sender = '@@sender.shinkai';
    const receiver = '@@receiver.shinkai';
    const sender_subidentity = 'sender_subidentity';
    const inbox = 'inbox_name';
    const count = 10;
    const offset = null;

    const message = await ShinkaiMessageBuilder.getLastUnreadMessagesFromInbox(
      my_subidentity_encryption_sk,
      my_subidentity_signature_sk,
      receiver_public_key,
      inbox,
      count,
      offset,
      sender_subidentity,
      sender,
      receiver,
    );

    // Check if the message body is an instance of EncryptedMessageBody
    if (message.body instanceof EncryptedMessageBody) {
      // You can add your assertions here related to the encrypted message
      // For example, you might want to check if the content is not empty
      expect(message.body.encrypted.content).not.toBe('');
    } else {
      throw new Error('Message body is not encrypted');
    }

    expect(message.external_metadata.sender).toBe(sender);
    expect(message.external_metadata.recipient).toBe(receiver);
  });

  it('should request to add an agent', async () => {
    const encryptionKeys = await generateEncryptionKeys();
    const signatureKeys = await generateSignatureKeys();

    const my_subidentity_encryption_sk = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_sk_string, 'hex'),
    );
    const my_subidentity_signature_sk = new Uint8Array(
      Buffer.from(signatureKeys.my_identity_sk_string, 'hex'),
    );
    const receiver_public_key = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_pk_string, 'hex'),
    );
    const sender = '@@sender.shinkai';
    const receiver = '@@receiver.shinkai';
    const sender_subidentity = 'sender_subidentity';
    const agent: SerializedAgent = {
      id: 'agent1',
      full_identity_name: 'ShinkaiName',
      perform_locally: false,
      external_url: 'http://example.com',
      api_key: '123456',
      model: {
        OpenAI: {
          model_type: 'gpt-3',
        },
      },
      toolkit_permissions: ['permission1', 'permission2'],
      storage_bucket_permissions: ['bucket1', 'bucket2'],
      allowed_message_senders: ['sender1', 'sender2'],
    };

    const message = await ShinkaiMessageBuilder.requestAddAgent(
      my_subidentity_encryption_sk,
      my_subidentity_signature_sk,
      receiver_public_key,
      agent,
      sender_subidentity,
      sender,
      receiver,
    );

    // Check if the message body is an instance of EncryptedMessageBody
    if (message.body instanceof EncryptedMessageBody) {
      // You can add your assertions here related to the encrypted message
      // For example, you might want to check if the content is not empty
      expect(message.body.encrypted.content).not.toBe('');
    } else {
      throw new Error('Message body is not encrypted');
    }

    expect(message.external_metadata.sender).toBe(sender);
    expect(message.external_metadata.recipient).toBe(receiver);
  });

  it('should read up to a certain time', async () => {
    const encryptionKeys = await generateEncryptionKeys();
    const signatureKeys = await generateSignatureKeys();

    const my_subidentity_encryption_sk = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_sk_string, 'hex'),
    );
    const my_subidentity_signature_sk = new Uint8Array(
      Buffer.from(signatureKeys.my_identity_sk_string, 'hex'),
    );
    const receiver_public_key = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_pk_string, 'hex'),
    );
    const sender = '@@sender.shinkai';
    const receiver = '@@receiver.shinkai';
    const sender_subidentity = 'sender_subidentity';
    const inbox = 'inbox_name';
    const upToTime = '2022-01-01T00:00:00Z';

    const message = await ShinkaiMessageBuilder.readUpToTime(
      my_subidentity_encryption_sk,
      my_subidentity_signature_sk,
      receiver_public_key,
      inbox,
      upToTime,
      sender_subidentity,
      sender,
      receiver,
    );

    // Check if the message body is an instance of EncryptedMessageBody
    if (message.body instanceof EncryptedMessageBody) {
      // You can add your assertions here related to the encrypted message
      // For example, you might want to check if the content is not empty
      expect(message.body.encrypted.content).not.toBe('');
    } else {
      throw new Error('Message body is not encrypted');
    }

    expect(message.external_metadata.sender).toBe(sender);
    expect(message.external_metadata.recipient).toBe(receiver);
  });

  it('should create an error message', async () => {
    const encryptionKeys = await generateEncryptionKeys();
    const signatureKeys = await generateSignatureKeys();

    const my_encryption_secret_key = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_sk_string, 'hex'),
    );
    const my_signature_secret_key = new Uint8Array(
      Buffer.from(signatureKeys.my_identity_sk_string, 'hex'),
    );
    const receiver_public_key = new Uint8Array(
      Buffer.from(encryptionKeys.my_encryption_pk_string, 'hex'),
    );
    const sender = '@@sender.shinkai';
    const receiver = '@@receiver.shinkai';
    const error_msg = 'An error occurred';

    const message = await ShinkaiMessageBuilder.errorMessage(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
      sender,
      receiver,
      error_msg,
    );

    // Check if the message body is an instance of EncryptedMessageBody
    if (message.body instanceof UnencryptedMessageBody) {
      const messageData = message.body.unencrypted.message_data;
      if (messageData instanceof EncryptedMessageData)
        expect(messageData.data).not.toBe('');
    } else {
      throw new Error('Message body is not encrypted');
    }

    expect(message.external_metadata.sender).toBe(sender);
    expect(message.external_metadata.recipient).toBe(receiver);
  });
});

describe('ShinkaiMessageBuilder general tests', () => {
  it('should build a message with all fields and no encryption', async () => {
    const my_identity_sk = await generateSignatureKeys();
    const my_encryption_sk = await generateEncryptionKeys();
    const node2_encryption_pk = await generateEncryptionKeys();

    const my_encryption_secret_key = new Uint8Array(
      Buffer.from(my_encryption_sk.my_encryption_sk_string, 'hex'),
    );
    const my_identity_secret_key = new Uint8Array(
      Buffer.from(my_identity_sk.my_identity_sk_string, 'hex'),
    );
    const my_identity_public_key = new Uint8Array(
      Buffer.from(my_identity_sk.my_identity_pk_string, 'hex'),
    );
    const receiver_public_key = new Uint8Array(
      Buffer.from(node2_encryption_pk.my_encryption_pk_string, 'hex'),
    );

    const recipient = '@@other_node.shinkai';
    const sender = '@@my_node.shinkai';
    const scheduled_time = '2023-07-02T20:53:34Z';

    const messageBuilder = new ShinkaiMessageBuilder(
      my_encryption_secret_key,
      my_identity_secret_key,
      receiver_public_key,
    );

    await messageBuilder.init();

    const message = await messageBuilder
      .set_message_raw_content('body content')
      .set_body_encryption(TSEncryptionMethod.None)
      .set_message_schema_type(MessageSchemaType.TextContent)
      .set_internal_metadata('', '', TSEncryptionMethod.None)
      .set_external_metadata_with_schedule(recipient, sender, scheduled_time)
      .build();

    expect(message).toBeDefined();

    if (message.body instanceof UnencryptedMessageBody) {
      const messageData = message.body.unencrypted
        .message_data as UnencryptedMessageData;
      if ('message_raw_content' in messageData.data) {
        expect(messageData.data.message_raw_content).toBe('body content');
      } else {
        throw new Error('Message data is not unencrypted');
      }
      expect(
        message.body.unencrypted.internal_metadata.sender_subidentity,
      ).toBe('');
      expect(
        message.body.unencrypted.internal_metadata.recipient_subidentity,
      ).toBe('');
      expect(message.body.unencrypted.internal_metadata.inbox).toBe(
        'inbox::@@my_node.shinkai::@@other_node.shinkai::false',
      );
    }

    expect(message.encryption).toBe(TSEncryptionMethod.None);
    expect(message.external_metadata.sender).toBe(sender);
    expect(message.external_metadata.scheduled_time).toBe(scheduled_time);
    expect(message.external_metadata.recipient).toBe(recipient);
    expect(
      message.verify_outer_layer_signature(my_identity_public_key),
    ).toBeTruthy();
  });

  it('should build a message with all fields and body encryption', async () => {
    const my_identity_sk = await generateSignatureKeys();
    const my_encryption_sk = await generateEncryptionKeys();
    const node2_encryption_pk = await generateEncryptionKeys();

    const my_encryption_secret_key = new Uint8Array(
      Buffer.from(my_encryption_sk.my_encryption_sk_string, 'hex'),
    );
    const my_identity_secret_key = new Uint8Array(
      Buffer.from(my_identity_sk.my_identity_sk_string, 'hex'),
    );
    const my_identity_public_key = new Uint8Array(
      Buffer.from(my_identity_sk.my_identity_pk_string, 'hex'),
    );
    const receiver_public_key = new Uint8Array(
      Buffer.from(node2_encryption_pk.my_encryption_pk_string, 'hex'),
    );

    const recipient = '@@other_node.shinkai';
    const sender = '@@my_node.shinkai';

    const messageBuilder = new ShinkaiMessageBuilder(
      my_encryption_secret_key,
      my_identity_secret_key,
      receiver_public_key,
    );

    await messageBuilder.init();

    const message = await messageBuilder
      .set_message_raw_content('body content')
      .set_body_encryption(TSEncryptionMethod.DiffieHellmanChaChaPoly1305)
      .set_message_schema_type(MessageSchemaType.TextContent)
      .set_internal_metadata('', '', TSEncryptionMethod.None)
      .set_external_metadata(recipient, sender)
      .build();

    expect(message).toBeDefined();

    if (message.body instanceof EncryptedMessageBody) {
      const decryptedMessage = await message.decrypt_outer_layer(
        my_encryption_secret_key,
        receiver_public_key,
      );

      if (decryptedMessage.body instanceof UnencryptedMessageBody) {
        const messageData = decryptedMessage.body.unencrypted
          .message_data as UnencryptedMessageData;
        if ('message_raw_content' in messageData.data) {
          expect(messageData.data.message_raw_content).toBe('body content');
        } else {
          throw new Error('Message data is not unencrypted');
        }
        expect(
          decryptedMessage.body.unencrypted.internal_metadata
            .sender_subidentity,
        ).toBe('');
        expect(
          decryptedMessage.body.unencrypted.internal_metadata
            .recipient_subidentity,
        ).toBe('');
        expect(decryptedMessage.body.unencrypted.internal_metadata.inbox).toBe(
          'inbox::@@my_node.shinkai::@@other_node.shinkai::false',
        );
      }
    }

    expect(message.encryption).toBe(
      TSEncryptionMethod.DiffieHellmanChaChaPoly1305,
    );
    expect(message.external_metadata.sender).toBe(sender);
    expect(message.external_metadata.recipient).toBe(recipient);
    expect(
      message.verify_outer_layer_signature(my_identity_public_key),
    ).toBeTruthy();
  });

  it('should fail to build a message with missing fields', async () => {
    const my_identity_sk = await generateSignatureKeys();
    const my_encryption_sk = await generateEncryptionKeys();
    const node2_encryption_pk = await generateEncryptionKeys();

    const my_encryption_secret_key = new Uint8Array(
      Buffer.from(my_encryption_sk.my_encryption_sk_string, 'hex'),
    );
    const my_identity_secret_key = new Uint8Array(
      Buffer.from(my_identity_sk.my_identity_sk_string, 'hex'),
    );
    const receiver_public_key = new Uint8Array(
      Buffer.from(node2_encryption_pk.my_encryption_pk_string, 'hex'),
    );

    const messageBuilder = new ShinkaiMessageBuilder(
      my_encryption_secret_key,
      my_identity_secret_key,
      receiver_public_key,
    );

    await messageBuilder.init();

    try {
      await messageBuilder.build();
      fail('Message build should have thrown an error due to missing fields');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
