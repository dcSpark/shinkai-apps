import * as sodium from 'libsodium-wrappers-sumo';

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
  const ciphertext = sodium.crypto_aead_chacha20poly1305_ietf_encrypt(
    message,
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
