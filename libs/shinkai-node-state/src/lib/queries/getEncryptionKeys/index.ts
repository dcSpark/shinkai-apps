import {
  generateEncryptionKeys,
  generateSignatureKeys,
} from '@shinkai_network/shinkai-message-ts/utils';

import { Encryptionkeys } from './types';

export const generateMyEncryptionKeys = async (): Promise<Encryptionkeys> => {
  let seed = crypto.getRandomValues(new Uint8Array(32));
  const deviceEncryptionKeys = await generateEncryptionKeys(seed);
  const deviceSignataureKeys = await generateSignatureKeys();
  seed = crypto.getRandomValues(new Uint8Array(32));
  const profileEncryptionKeys = await generateEncryptionKeys(seed);
  const profileSignatureKeys = await generateSignatureKeys();

  return {
    my_device_encryption_pk: deviceEncryptionKeys.my_encryption_pk_string,
    my_device_encryption_sk: deviceEncryptionKeys.my_encryption_sk_string,
    my_device_identity_pk: deviceSignataureKeys.my_identity_pk_string,
    my_device_identity_sk: deviceSignataureKeys.my_identity_sk_string,
    profile_encryption_pk: profileEncryptionKeys.my_encryption_pk_string,
    profile_encryption_sk: profileEncryptionKeys.my_encryption_sk_string,
    profile_identity_pk: profileSignatureKeys.my_identity_pk_string,
    profile_identity_sk: profileSignatureKeys.my_identity_sk_string,
  };
};
