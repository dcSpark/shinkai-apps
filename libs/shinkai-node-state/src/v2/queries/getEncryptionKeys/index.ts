import {
  generateEncryptionKeys,
  generateSignatureKeys,
} from '@shinkai_network/shinkai-message-ts/utils';

import { type Encryptionkeys } from './types';

export const generateMyEncryptionKeys = async (): Promise<Encryptionkeys> => {
  let seed = crypto.getRandomValues(new Uint8Array(32));
  seed = crypto.getRandomValues(new Uint8Array(32));
  const profileEncryptionKeys = await generateEncryptionKeys(seed);
  const profileSignatureKeys = await generateSignatureKeys();

  return {
    profile_encryption_pk: profileEncryptionKeys.my_encryption_pk_string,
    profile_encryption_sk: profileEncryptionKeys.my_encryption_sk_string,
    profile_identity_pk: profileSignatureKeys.my_identity_pk_string,
    profile_identity_sk: profileSignatureKeys.my_identity_sk_string,
  };
};
