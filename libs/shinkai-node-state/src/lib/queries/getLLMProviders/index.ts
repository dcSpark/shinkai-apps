import { getLLMProviders as getLLMProvidersAPI } from '@shinkai_network/shinkai-message-ts/api';

import type { GetLLMProvidersInput } from './types';

export const getLLMProviders = async ({
  nodeAddress,
  sender,
  senderSubidentity,
  shinkaiIdentity,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: GetLLMProvidersInput) => {
  const result = await getLLMProvidersAPI(
    nodeAddress,
    sender,
    senderSubidentity,
    shinkaiIdentity,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );
  return result;
};
