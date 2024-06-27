import { updateLLMProvider as updateLLMProviderAPI } from '@shinkai_network/shinkai-message-ts/api';

import { UpdateLLMProviderInput } from './types';

export const updateLLMProvider = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  agent,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: UpdateLLMProviderInput) => {
  return await updateLLMProviderAPI(
    nodeAddress,
    agent,
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
