import * as sodium from 'libsodium-wrappers-sumo';

import {
  decryptMessageWithPassphrase,
  encryptMessageWithPassphrase,
} from './shinkai-encryption';

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
