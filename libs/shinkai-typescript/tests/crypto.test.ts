// tests/crypto.test.ts
import { Crypto } from '@peculiar/webcrypto';
import sodium from 'libsodium-wrappers-sumo';
import nacl from 'tweetnacl';

import { hexToBytes, toHexString } from '../src/cryptography/crypto_utils';
import {
  decryptMessageBody,
  decryptMessageData,
  decryptMessageWithPassphrase,
  encryptMessageBody,
  encryptMessageData,
  encryptMessageWithPassphrase,
  generateEncryptionKeys,
  generateSignatureKeys,
} from '../src/cryptography/shinkai_encryption';
import {
  sign_inner_layer,
  sign_outer_layer,
  verify_inner_layer_signature,
  verify_outer_layer_signature,
} from '../src/cryptography/shinkai_signing';
import { MessageSchemaType } from '../src/schemas/schema_types';
import { ShinkaiMessage } from '../src/shinkai_message/shinkai_message';
import { UnencryptedMessageBody } from '../src/shinkai_message/shinkai_message_body';

const crypto = new Crypto();
globalThis.crypto = crypto;

describe('Cryptography Functions', () => {
  test('encrypt and decrypt message body using keys', async () => {
    const originalMessage = '{"text":"Hello, world!"}';
    const senderKeys = await generateEncryptionKeys();
    const recipientKeys = await generateEncryptionKeys();

    // Convert keys from HexString to Uint8Array
    const senderPrivateKey = hexToBytes(senderKeys.my_encryption_sk_string);
    const senderPublicKey = hexToBytes(senderKeys.my_encryption_pk_string);
    const recipientPrivateKey = hexToBytes(
      recipientKeys.my_encryption_sk_string,
    );
    const recipientPublicKey = hexToBytes(
      recipientKeys.my_encryption_pk_string,
    );

    // Encrypt the message
    const encryptedMessage = await encryptMessageBody(
      originalMessage,
      senderPrivateKey,
      recipientPublicKey,
    );

    // Decrypt the message
    const decryptedMessage = await decryptMessageBody(
      encryptedMessage,
      recipientPrivateKey,
      senderPublicKey,
    );

    // Convert the decrypted message back into a JSON string
    const decryptedMessageString = JSON.stringify(decryptedMessage);

    // The decrypted message should be the same as the original message
    expect(decryptedMessageString).toBe(originalMessage);
  });

  test('encrypt and decrypt message with passphrase', async () => {
    await sodium.ready; // Ensure sodium is fully loaded

    const originalMessage = 'Hello, world!';
    const passphrase = 'my secret passphrase';

    // Encrypt the message
    const encryptedMessage = await encryptMessageWithPassphrase(
      originalMessage,
      passphrase,
    );

    // Decrypt the message
    const decryptedMessage = await decryptMessageWithPassphrase(
      encryptedMessage,
      passphrase,
    );

    // The decrypted message should be the same as the original message
    expect(decryptedMessage).toBe(originalMessage);
  });

  test('decrypt provided encrypted body message', async () => {
    // Note: This is a real encrypted message from the Shinkai Node
    const encryptedMessage =
      'encrypted:cf6e0fdc56f0775188b451bbc4fa4188583c3195e16989bba7f664f83394dfe37a66104875013a5f99a4a17c2898cf12ead7f36a7eb289b70bb648f14175bde8b723e14a8fb79033076b2e9e5b987f097089c22572c80cd0cf4879a13d84b18fe894a58d55f117437ea812f5fbb5b46a467be8e668a5e6b95e6a6971643e72ff04cd88007f9b6e677debcb8474c406b8bf3ef7f6f9e1cdf6df2ee5b76bc678ffb8c7cc9de911694e3814edf5beb4bd9bd258976446bfc0038ae02bf117e5a9e6598d850782eac9024ac665b4191df513c6e9948befdaae3429e858bcfba8a0a01e64c37e2cc6ae3189e2ec632cb7f706678a2e4436b3b8c14edf1e23b512135f6768d04d4ea7df069d682b895a5abc7cf90d57dc6aaf11c920394b19d208838af3a11fc4a821752733f03b65c2552279498ab52feed614c6b5144640c680fd0570bcead01fe4c5f8c33f5f568d55050336149d5ddfc560431a6d2c80830626b84f9275ec96a75b89bc9494f5db12e7f1ea17db2a54affb0c90833901ba930e590cea56e1a7ace8270d9d3ece849cd827589626fc6bc6c260d6e74da909eb4bbc6c1da402e6c7bae780e316944adcf41c33d84b595a1df09496f4b32e5ee9af5992e187fc3fccc642a6a08d';
    const myEncryptionSecretKey =
      'e82bd03bf86b935fa34d71ad7ebb049f1f10f87d343e521511d8f9e66256204d';
    const receiverPublicKey =
      '912fed05e286af45f44580d6a87da61e1f9a0946237dd29f7bc2d3cbeba0857f';

    // Convert keys from HexString to Uint8Array
    const myPrivateKey = hexToBytes(myEncryptionSecretKey);
    const recipientPublicKey = hexToBytes(receiverPublicKey);

    // Decrypt the message
    const decryptedMessage = await decryptMessageBody(
      encryptedMessage,
      myPrivateKey,
      recipientPublicKey,
    );

    // Check if the decryptedMessage is equal to the expected object
    expect(decryptedMessage).toEqual({
      message_data: {
        unencrypted: {
          message_raw_content: 'Test data',
          message_content_schema: 'TextContent',
        },
      },
      internal_metadata: {
        sender_subidentity: '',
        recipient_subidentity: '',
        inbox:
          'inbox::@@receiver_node.shinkai::@@receiver_node.shinkai/sender_profile::false',
        signature:
          '529fb1301b03d7813c32106c6739bb0366c3fd1a3b2a41f96f2f7a598a1d5deb9a8446b42168816a6409fbc49b474438d31a91d516e2151721d1ef0ab8363506',
        encryption: 'None',
      },
    });
  });

  test('decrypt provided encrypted data message', async () => {
    // Note: This is a real encrypted message from the Shinkai Node
    const encryptedMessage =
      'encrypted:11000000000000000b00000000000000105b49f6cc037679b9863a3cae6dde277e1300d29cc9cc92e3a7a1639b741facb6bb7f4b6fdb04fbbeb46d32555159f1f5dcf6268d07e9cf';
    const myEncryptionSecretKey =
      '08ad9a2f5f9418b386cce489a0bac8cb5bba34171864909e4dfec1ea4e26bf77';
    const receiverPublicKey =
      '96722725a1361f6108aa6cc967032e8dc9667b17058ca630c8861deff69b3f2f';

    // Convert keys from HexString to Uint8Array
    const myPrivateKey = hexToBytes(myEncryptionSecretKey);
    const recipientPublicKey = hexToBytes(receiverPublicKey);

    // Decrypt the message
    const decryptedMessage = await decryptMessageData(
      encryptedMessage,
      myPrivateKey,
      recipientPublicKey,
    );

    // Check if the decryptedMessage is equal to the expected object
    expect(decryptedMessage).toEqual({
      message_raw_content: 'test body content',
      message_content_schema: 'TextContent',
    });
  });

  test('sign and verify outer layer signature', async () => {
    const unsorted_messageJson = `{
        "body": {
            "unencrypted": {
                "message_data": {
                    "unencrypted": {
                        "message_content_schema": "TextContent",
                        "message_raw_content": "hey!"
                    }
                },
                "internal_metadata": {
                    "inbox": "inbox::@@node1.shinkai/main/device/main_device::@@node2.shinkai::false",
                    "sender_subidentity": "main/device/main_device",
                    "encryption": "None",
                    "recipient_subidentity": "",
                    "signature": "c6d0115c0878fbf2279f98aab67c0e9cb1af63825f49dca48d6e4420eba0ceb973e00488ba0905c9afd09254f0dac48c468fdcb1d6c5ab5ca4c5dd70a440b903"
                }
                
            }
        },
        "external_metadata": {
            "recipient": "@@node2.shinkai",
            "other": "",
            "sender": "@@node1.shinkai",
            "scheduled_time": "2023-08-25T22:44:01.132Z",
            "intra_sender": "intra_sender",
            "signature": "d7d0115c0878fbf2279f98aab67c0e9cb1af63825f49dca48d6e4420eba0ceb973e00488ba0905c9afd09254f0dac48c468fdcb1d6c5ab5ca4c5dd70a389f123"
        },
        "encryption": "DiffieHellmanChaChaPoly1305",
        "version": "V1_0"
      }`;

    const keys = await generateSignatureKeys();

    // Convert keys from HexString to Uint8Array
    const privateKey = hexToBytes(keys.my_identity_sk_string);
    const publicKey = hexToBytes(keys.my_identity_pk_string);

    // Parse the message JSON to a ShinkaiMessage object
    const shinkaiMessage: ShinkaiMessage = JSON.parse(unsorted_messageJson);

    // Sign the message
    await sign_outer_layer(privateKey, shinkaiMessage);

    // Verify the signature
    const isValid = await verify_outer_layer_signature(
      publicKey,
      shinkaiMessage,
    );

    // The signature should be valid
    expect(isValid).toBe(true);
  });

  test('encrypt and decrypt message data using keys', async () => {
    const originalData = {
      message_raw_content: 'Hello, world!',
      message_content_schema: 'TextContent' as MessageSchemaType,
    };
    const senderKeys = await generateEncryptionKeys();
    const recipientKeys = await generateEncryptionKeys();

    // Convert keys from HexString to Uint8Array
    const senderPrivateKey = hexToBytes(senderKeys.my_encryption_sk_string);
    const senderPublicKey = hexToBytes(senderKeys.my_encryption_pk_string);
    const recipientPrivateKey = hexToBytes(
      recipientKeys.my_encryption_sk_string,
    );
    const recipientPublicKey = hexToBytes(
      recipientKeys.my_encryption_pk_string,
    );

    // Encrypt the message data
    const encryptedData = await encryptMessageData(
      originalData,
      senderPrivateKey,
      recipientPublicKey,
    );

    // Decrypt the message data
    const decryptedData = await decryptMessageData(
      encryptedData,
      recipientPrivateKey,
      senderPublicKey,
    );

    // The decrypted data should be the same as the original data
    expect(decryptedData).toEqual(originalData);
  });

  test('sign and verify inner layer signature', async () => {
    const unsorted_messageJson = `{
    "body": {
      "unencrypted": {
        "message_data": {
          "unencrypted": {
            "message_content_schema": "TextContent",
            "message_raw_content": "hey!"
          }
        },
        "internal_metadata": {
          "inbox": "inbox::@@node1.shinkai/main/device/main_device::@@node2.shinkai::false",
          "sender_subidentity": "main/device/main_device",
          "encryption": "None",
          "recipient_subidentity": "",
          "signature": ""
        }
      }
    },
    "external_metadata": {
      "recipient": "@@node2.shinkai",
      "other": "",
      "sender": "@@node1.shinkai",
      "scheduled_time": "2023-08-25T22:44:01.132Z",
      "intra_sender": "intra_sender",
      "signature": "d7d0115c0878fbf2279f98aab67c0e9cb1af63825f49dca48d6e4420eba0ceb973e00488ba0905c9afd09254f0dac48c468fdcb1d6c5ab5ca4c5dd70a389f123"
    },
    "encryption": "DiffieHellmanChaChaPoly1305",
    "version": "V1_0"
  }`;

    const keys = await generateSignatureKeys();

    // Convert keys from HexString to Uint8Array
    const privateKey = hexToBytes(keys.my_identity_sk_string);
    const publicKey = hexToBytes(keys.my_identity_pk_string);

    // Parse the JSON string to a plain object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messageData: any = JSON.parse(unsorted_messageJson);

    // Create a new ShinkaiMessage instance
    const shinkaiMessage = new ShinkaiMessage(
      new UnencryptedMessageBody(messageData.body.unencrypted),
      messageData.external_metadata,
      messageData.encryption,
      messageData.version,
    );

    if (shinkaiMessage.body instanceof UnencryptedMessageBody) {
      // Sign the message
      await sign_inner_layer(privateKey, shinkaiMessage.body.unencrypted);

      // Verify the signature
      const isValid = await verify_inner_layer_signature(
        publicKey,
        shinkaiMessage.body.unencrypted,
      );

      // The signature should be valid
      expect(isValid).toBe(true);
    } else {
      throw new Error('Message body is not unencrypted');
    }
  });

  test('check compatibility between crypto encryption libraries for key management', async () => {
    const keys = await generateEncryptionKeys();

    // Convert keys from HexString to Uint8Array
    const privateKey = hexToBytes(keys.my_encryption_sk_string);
    const originalPublicKey = hexToBytes(keys.my_encryption_pk_string);

    // Compute the public key from the private key using tweetnacl
    const computedPublicKey =
      nacl.box.keyPair.fromSecretKey(privateKey).publicKey;

    // The computed public key should be the same as the original public key
    expect(toHexString(computedPublicKey)).toBe(toHexString(originalPublicKey));
  });

  // end of describe
});
