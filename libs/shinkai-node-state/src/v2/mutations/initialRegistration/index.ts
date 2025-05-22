import { initialRegistration as initialRegistrationApi } from '@shinkai_network/shinkai-message-ts/api/general/index';
import { InitialRegistrationResponse } from '@shinkai_network/shinkai-message-ts/api/general/types';

export type InitialRegistrationInput = {
  nodeAddress: string;
  profileEncryptionPk: string;
  profileIdentityPk: string;
};

export type InitialRegistrationOutput = InitialRegistrationResponse;

export const initialRegistration = async ({
  nodeAddress,
  profileEncryptionPk,
  profileIdentityPk,
}: InitialRegistrationInput) => {
  const response = await initialRegistrationApi(nodeAddress, {
    profile_encryption_pk: profileEncryptionPk,
    profile_identity_pk: profileIdentityPk,
  });
  return response;
};
