import { blake3 } from '@noble/hashes/blake3';
import * as ed from 'noble-ed25519';

import { ShinkaiBody } from '../shinkai_message/shinkai_body';
import { ShinkaiMessage } from '../shinkai_message/shinkai_message';

// TODO(Nico): move somewhere else
export class ShinkaiMessageError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'ShinkaiMessageError';
  }
}

export async function verify_outer_layer_signature(
  publicKey: Uint8Array,
  shinkaiMessage: ShinkaiMessage,
): Promise<boolean> {
  try {
    const hexSignature = shinkaiMessage.external_metadata.signature;
    if (!hexSignature) {
      throw new ShinkaiMessageError(`Signature is missing`);
    }
    const matched = hexSignature.match(/.{1,2}/g);
    if (!matched) {
      throw new ShinkaiMessageError(`Invalid signature format`);
    }
    const signatureBytes = new Uint8Array(
      matched.map((byte) => parseInt(byte, 16)),
    );

    // Create a copy of the message with an empty signature
    const messageCopy = JSON.parse(JSON.stringify(shinkaiMessage));
    messageCopy.external_metadata.signature = '';

    const sortedShinkaiMessage = sortObjectKeys(shinkaiMessage);
    // Calculate the hash of the modified message
    const messageHash = blake3FromObj(sortedShinkaiMessage);
    const messageHashMatched = messageHash.match(/.{1,2}/g);
    if (!messageHashMatched) {
      throw new ShinkaiMessageError(`Invalid message hash format`);
    }
    const messageHashBytes = new Uint8Array(
      messageHashMatched.map((byte) => parseInt(byte, 16)),
    );

    return await ed.verify(signatureBytes, messageHashBytes, publicKey);
  } catch (e) {
    if (e instanceof Error) {
      throw new ShinkaiMessageError(`Signing error: ${e.message}`);
    } else {
      throw new ShinkaiMessageError(`Signing error: ${e}`);
    }
  }
}

export async function sign_outer_layer(
  secretKey: Uint8Array,
  shinkaiMessage: ShinkaiMessage,
): Promise<void> {
  try {
    // Ensure that external_metadata.signature is empty
    const messageCopy = JSON.parse(JSON.stringify(shinkaiMessage));
    messageCopy.external_metadata.signature = '';

    const sortedShinkaiMessage = sortObjectKeys(shinkaiMessage);
    const messageHash = blake3FromObj(sortedShinkaiMessage);
    const messageHashMatched = messageHash.match(/.{1,2}/g);
    if (!messageHashMatched) {
      throw new ShinkaiMessageError(`Invalid message hash format`);
    }
    const messageHashBytes = new Uint8Array(
      messageHashMatched.map((byte) => parseInt(byte, 16)),
    );

    const signature = await ed.sign(messageHashBytes, secretKey);
    shinkaiMessage.external_metadata.signature = Array.from(signature)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (e) {
    if (e instanceof Error) {
      throw new ShinkaiMessageError(`Signing error: ${e.message}`);
    } else {
      throw new ShinkaiMessageError(`Signing error: ${e}`);
    }
  }
}

export async function sign_inner_layer(
  secretKey: Uint8Array,
  shinkaiBody: ShinkaiBody,
): Promise<void> {
  try {
    // Ensure that body.unencrypted.internal_metadata.signature is empty
    const messageCopy: ShinkaiBody = JSON.parse(JSON.stringify(shinkaiBody));
    messageCopy.internal_metadata.signature = '';

    const sortedShinkaiMessage = sortObjectKeys(messageCopy);
    const messageHash = blake3FromObj(sortedShinkaiMessage);
    const messageHashMatched = messageHash.match(/.{1,2}/g);
    if (!messageHashMatched) {
      throw new ShinkaiMessageError(`Invalid message hash format`);
    }
    const messageHashBytes = new Uint8Array(
      messageHashMatched.map((byte) => parseInt(byte, 16)),
    );

    const signature = await ed.sign(messageHashBytes, secretKey);
    shinkaiBody.internal_metadata.signature = Array.from(signature)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (e) {
    if (e instanceof Error) {
      console.log(shinkaiBody);
      throw new ShinkaiMessageError(`Signing error: ${e.message}`);
    } else {
      throw new ShinkaiMessageError(`Signing error: ${e}`);
    }
  }
}

export async function verify_inner_layer_signature(
  publicKey: Uint8Array,
  shinkaiBody: ShinkaiBody,
): Promise<boolean> {
  try {
    const hexSignature = shinkaiBody.internal_metadata.signature;
    console.log('Signature from body:', hexSignature);
    if (!hexSignature) {
      throw new ShinkaiMessageError(`Signature is missing`);
    }
    const matched = hexSignature.match(/.{1,2}/g);
    if (!matched) {
      throw new ShinkaiMessageError(`Invalid signature format`);
    }
    const signatureBytes = new Uint8Array(
      matched.map((byte) => parseInt(byte, 16)),
    );

    // Create a copy of the message with an empty signature
    const bodyCopy = JSON.parse(JSON.stringify(shinkaiBody));
    bodyCopy.internal_metadata.signature = '';

    const sortedShinkaiBody = sortObjectKeys(bodyCopy);
    // Calculate the hash of the modified message
    const bodyHash = blake3FromObj(sortedShinkaiBody);
    const bodyHashMatched = bodyHash.match(/.{1,2}/g);
    if (!bodyHashMatched) {
      throw new ShinkaiMessageError(`Invalid message hash format`);
    }
    const messageHashBytes = new Uint8Array(
      bodyHashMatched.map((byte) => parseInt(byte, 16)),
    );

    return await ed.verify(signatureBytes, messageHashBytes, publicKey);
  } catch (e) {
    if (e instanceof Error) {
      throw new ShinkaiMessageError(`Signing error: ${e.message}`);
    } else {
      throw new ShinkaiMessageError(`Signing error: ${e}`);
    }
  }
}

export const blake3FromObj = (obj: object): string => {
  const sortedString = JSON.stringify(obj, Object.keys(obj).sort());
  const hashAlt = blake3(sortedString);
  const hashAltHex = Array.from(new Uint8Array(hashAlt))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashAltHex;
}

// TODO: Fix this any typification
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sortObjectKeys(obj: any): object {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  // TODO: Fix this any typification
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortedObj: { [key: string]: any } = {};

  Object.keys(obj)
    .sort()
    .forEach((key: string) => {
      if (key in obj && typeof obj[key] === 'object' && obj[key] !== null) {
        sortedObj[key] =
          obj[key] instanceof Object ? sortObjectKeys(obj[key]) : obj[key];
      } else {
        sortedObj[key] = obj[key];
      }
    });

  return sortedObj;
}
