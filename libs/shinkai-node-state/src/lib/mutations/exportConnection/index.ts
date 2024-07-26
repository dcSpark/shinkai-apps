import { encryptMessageWithPassphrase } from '@shinkai_network/shinkai-message-ts/cryptography/shinkai-encryption';

import { ExportConnectionInput } from './types';

export const exportConnection = async ({
  message,
  passphrase,
}: ExportConnectionInput) => {
  return await encryptMessageWithPassphrase(message, passphrase);
};
