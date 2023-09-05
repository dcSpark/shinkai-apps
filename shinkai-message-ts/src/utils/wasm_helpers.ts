
import { generateKeyPair } from 'curve25519-js';
import * as ed from '@noble/ed25519';

type HexString = string;

export function toHexString(byteArray: Uint8Array) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

export const generateEncryptionKeys = async (seed: Uint8Array): Promise<{my_encryption_sk_string: HexString, my_encryption_pk_string: HexString}> => {
  const encryptionKeys = generateKeyPair(seed);
  const my_encryption_sk_string: string = toHexString(encryptionKeys.private);
  const my_encryption_pk_string: string = toHexString(encryptionKeys.public);

  return {
    my_encryption_sk_string,
    my_encryption_pk_string,
  }
}

export const generateSignatureKeys = async (): Promise<{my_identity_sk_string: HexString, my_identity_pk_string: HexString}> => {
  const privKey = ed.utils.randomPrivateKey();
  const pubKey = await ed.getPublicKeyAsync(privKey);

  const my_identity_sk_string: string = toHexString(privKey);
  const my_identity_pk_string: string = toHexString(pubKey);

  return {
    my_identity_sk_string,
    my_identity_pk_string,
  }
}

export const test_util_generateKeys = async (): Promise<{my_encryption_sk_string: HexString, my_encryption_pk_string: HexString, receiver_public_key_string: HexString, my_identity_sk_string: HexString, my_identity_pk_string: HexString}> => {
  const seed = new Uint8Array(32);

  const encryptionKeys = await generateEncryptionKeys(seed);
  const signatureKeys = await generateSignatureKeys();

  return {
    ...encryptionKeys,
    receiver_public_key_string: encryptionKeys.my_encryption_pk_string,
    ...signatureKeys
  }
}

export function mapEncryptionMethod(encryption: String): number {
    switch (encryption) {
      case "DiffieHellmanChaChaPoly1305":
        return 0;
      case "None":
        return 1;
      default:
        throw new Error("Unknown encryption method");
    }
  }
  