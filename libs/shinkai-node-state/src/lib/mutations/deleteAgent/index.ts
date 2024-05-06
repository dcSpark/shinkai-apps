import { deleteAgent as deleteAgentAPI } from '@shinkai_network/shinkai-message-ts/api';

import { DeleteAgentInput } from './types';

export const deleteAgent = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  agentId,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: DeleteAgentInput) => {
  return await deleteAgentAPI(
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
