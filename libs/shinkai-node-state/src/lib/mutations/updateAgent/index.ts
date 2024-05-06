import { updateAgent as updateAgentAPI } from '@shinkai_network/shinkai-message-ts/api';

import { UpdateAgentInput } from './types';

export const updateAgent = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  agent,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: UpdateAgentInput) => {
  return await updateAgentAPI(
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
