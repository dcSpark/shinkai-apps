// import * as ed from "@noble/ed25519";
import { blake3 } from '@noble/hashes/blake3';
import crypto from 'crypto';
import { generateKeyPair, sharedKey } from 'curve25519-js';
import sodium from 'libsodium-wrappers-sumo';
import * as ed from 'noble-ed25519';

import { MessageSchemaType } from '../schemas/schema_types';
import { ShinkaiData } from '../shinkai_message/shinkai_data';
import { UnencryptedMessageBody } from '../shinkai_message/shinkai_message_body';
import { toHexString } from './crypto_utils';
import { ShinkaiMessageError } from './shinkai_signing';

export type HexString = string;
// Previous

export const generateEncryptionKeys = async (
  seed?: Uint8Array,
): Promise<{
  my_encryption_sk_string: HexString;
  my_encryption_pk_string: HexString;
}> => {
  seed = seed || crypto.getRandomValues(new Uint8Array(32));
  const encryptionKeys = generateKeyPair(seed);
  const my_encryption_sk_string: string = toHexString(encryptionKeys.private);
  const my_encryption_pk_string: string = toHexString(encryptionKeys.public);

  return {
    my_encryption_sk_string,
    my_encryption_pk_string,
  };
};

export const generateSignatureKeys = async (
  seed?: Uint8Array,
): Promise<{
  my_identity_sk_string: HexString;
  my_identity_pk_string: HexString;
}> => {
  seed = seed || ed.utils.randomPrivateKey();
  const privKey = new Uint8Array(seed);
  const pubKey = await ed.getPublicKey(privKey);

  const my_identity_sk_string: string = toHexString(privKey);
  const my_identity_pk_string: string = toHexString(pubKey);

  return {
    my_identity_sk_string,
    my_identity_pk_string,
  };
};

export async function encryptMessageBody(
  message: string,
  self_sk: Uint8Array,
  destination_pk: Uint8Array,
): Promise<string> {
  await sodium.ready;

  const shared_secret = sharedKey(self_sk, destination_pk);
  const key = blake3(shared_secret);

  const nonce = sodium.randombytes_buf(
    sodium.crypto_aead_chacha20poly1305_IETF_NPUBBYTES,
  );
  const plaintext_bytes = sodium.from_string(message);
  const ciphertext = sodium.crypto_aead_chacha20poly1305_ietf_encrypt(
    plaintext_bytes,
    null,
    null,
    nonce,
    key,
  );

  const encrypted_body = sodium.to_hex(nonce) + sodium.to_hex(ciphertext);
  return `encrypted:${encrypted_body}`;
}

export async function decryptMessageBody(
  encryptedBody: string,
  self_sk: Uint8Array,
  sender_pk: Uint8Array,
): Promise<UnencryptedMessageBody> {
  await sodium.ready;

  const parts: string[] = encryptedBody.split(':');
  if (parts[0] !== 'encrypted') {
    throw new Error('Unexpected variant');
  }

  const content = parts[1];
  const shared_secret = sharedKey(self_sk, sender_pk);
  const key = blake3(shared_secret);

  const decoded = sodium.from_hex(content);
  const nonce = decoded.slice(0, 12);
  const ciphertext = decoded.slice(12);

  const plaintext_bytes = sodium.crypto_aead_chacha20poly1305_ietf_decrypt(
    null,
    ciphertext,
    null,
    nonce,
    key,
  );

  if (!plaintext_bytes) {
    throw new Error('Decryption failure!');
  }

  const decrypted_body = sodium.to_string(plaintext_bytes);

  try {
    const messageBody: UnencryptedMessageBody = JSON.parse(decrypted_body);
    return messageBody;
  } catch (e) {
    throw new Error('Decryption failure!: ' + e?.toString());
  }
}

export async function encryptMessageData(
  data: ShinkaiData,
  self_sk: Uint8Array,
  destination_pk: Uint8Array,
): Promise<string> {
  await sodium.ready;

  const shared_secret = sharedKey(self_sk, destination_pk);
  const key = blake3(shared_secret);

  const combined_content =
    data.message_raw_content + data.message_content_schema;
  const combined_content_bytes = new TextEncoder().encode(combined_content);

  const content_len_bytes = new Uint8Array(8);
  new DataView(content_len_bytes.buffer).setUint32(
    0,
    data.message_raw_content.length,
    true,
  );

  const schema_len_bytes = new Uint8Array(8);
  new DataView(schema_len_bytes.buffer).setUint32(
    0,
    data.message_content_schema.length,
    true,
  );

  const nonce = sodium.randombytes_buf(
    sodium.crypto_aead_chacha20poly1305_IETF_NPUBBYTES,
  );

  const ciphertext = sodium.crypto_aead_chacha20poly1305_ietf_encrypt(
    combined_content_bytes,
    null,
    null,
    nonce,
    key,
  );

  const encrypted_body =
    sodium.to_hex(content_len_bytes) +
    sodium.to_hex(schema_len_bytes) +
    sodium.to_hex(nonce) +
    sodium.to_hex(ciphertext);
  return `encrypted:${encrypted_body}`;
}

export async function decryptMessageData(
  encryptedBody: string,
  self_sk: Uint8Array,
  sender_pk: Uint8Array,
): Promise<ShinkaiData> {
  await sodium.ready;

  const parts: string[] = encryptedBody.split(':');
  if (parts[0] !== 'encrypted') {
    throw new ShinkaiMessageError('Unexpected variant');
  }

  const content = parts[1];
  const shared_secret = sharedKey(self_sk, sender_pk);
  const key = blake3(shared_secret);

  const decoded = sodium.from_hex(content);
  const content_len_bytes = decoded.slice(0, 8);
  const remainder = decoded.slice(16);
  const nonce = remainder.slice(0, 12);
  const ciphertext = remainder.slice(12);

  const content_len = new DataView(content_len_bytes.buffer).getUint32(0, true);

  const plaintext_bytes = sodium.crypto_aead_chacha20poly1305_ietf_decrypt(
    null,
    ciphertext,
    null,
    nonce,
    key,
  );

  if (!plaintext_bytes) {
    throw new ShinkaiMessageError('Decryption failure!');
  }

  const content_bytes = plaintext_bytes.slice(0, content_len);
  const schema_bytes = plaintext_bytes.slice(content_len);

  const final_content = new TextDecoder().decode(content_bytes);
  const schema: MessageSchemaType = new TextDecoder().decode(schema_bytes) as MessageSchemaType;

  return {
    message_raw_content: final_content,
    message_content_schema: schema,
  };
}

export async function encryptMessageWithPassphrase(
  message: string,
  passphrase: string,
): Promise<string> {
  await sodium.ready;

  const salt = sodium.randombytes_buf(16); // Use a fixed length for the salt
  const key = sodium.crypto_pwhash(
    32,
    passphrase,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_DEFAULT,
  );

  const nonce = sodium.randombytes_buf(
    sodium.crypto_aead_chacha20poly1305_IETF_NPUBBYTES,
  );
  const plaintext_bytes = sodium.from_string(message);
  const ciphertext = sodium.crypto_aead_chacha20poly1305_ietf_encrypt(
    plaintext_bytes,
    null,
    null,
    nonce,
    key,
  );

  const encrypted_body =
    sodium.to_hex(salt) + sodium.to_hex(nonce) + sodium.to_hex(ciphertext);
  return `encrypted:${encrypted_body}`;
}

export async function decryptMessageWithPassphrase(
  encryptedBody: string,
  passphrase: string,
): Promise<string | null> {
  await sodium.ready;

  const parts: string[] = encryptedBody.split(':');
  if (parts[0] !== 'encrypted') {
    throw new Error('Unexpected variant');
  }

  const content = parts[1];
  const salt = sodium.from_hex(content.slice(0, 32)); // Get the salt from the encrypted message
  const key = sodium.crypto_pwhash(
    32,
    passphrase,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_DEFAULT,
  );

  const nonce = sodium.from_hex(content.slice(32, 56));
  const ciphertext = sodium.from_hex(content.slice(56));

  try {
    const plaintext_bytes = sodium.crypto_aead_chacha20poly1305_ietf_decrypt(
      null,
      ciphertext,
      null,
      nonce,
      key,
    );
    const decrypted_body = sodium.to_string(plaintext_bytes);
    return decrypted_body;
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
      throw new Error('Decryption failure!: ' + e.message);
    } else {
      throw new Error('Decryption failure!');
    }
  }
}
