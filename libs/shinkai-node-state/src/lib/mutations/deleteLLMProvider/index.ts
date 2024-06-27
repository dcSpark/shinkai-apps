import { deleteLLMProvider as deleteLLMProviderAPI } from '@shinkai_network/shinkai-message-ts/api';

import { DeleteLLMProviderInput } from './types';

export const deleteLLMProvider = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  agentId,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: DeleteLLMProviderInput) => {
  return await deleteLLMProviderAPI(
    nodeAddress,
    agentId,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );
};
