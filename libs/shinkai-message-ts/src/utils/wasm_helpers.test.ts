import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { Crypto } from '@peculiar/webcrypto';

import { generateEncryptionKeys, generateSignatureKeys } from './wasm_helpers';

// Enable synchronous methods
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

const crypto = new Crypto();
Object.defineProperty(globalThis, 'crypto', {
  value: crypto,
});

describe('Key generation functions', () => {
  test('should generate valid encryption keys', async () => {
    const seed = new Uint8Array(32);
    const keys = await generateEncryptionKeys(seed);

    expect(keys).toHaveProperty('my_encryption_sk_string');
    expect(keys).toHaveProperty('my_encryption_pk_string');

    expect(typeof keys.my_encryption_sk_string).toBe('string');
    expect(typeof keys.my_encryption_pk_string).toBe('string');
  });

  test('should generate valid signature keys', async () => {
    const keys = await generateSignatureKeys();

    expect(keys).toHaveProperty('my_identity_sk_string');
    expect(keys).toHaveProperty('my_identity_pk_string');

    expect(typeof keys.my_identity_sk_string).toBe('string');
    expect(typeof keys.my_identity_pk_string).toBe('string');
  });
});
