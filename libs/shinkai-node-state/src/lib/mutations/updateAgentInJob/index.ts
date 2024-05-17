import { updateAgentInJob as updateAgentInJobApi } from '@shinkai_network/shinkai-message-ts/api';

import { UpdateAgentInJobInput } from './types';

export const updateAgentInJob = async ({
  nodeAddress,
  jobId,
  newAgentId,
  shinkaiIdentity,
  profile,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: UpdateAgentInJobInput) => {
  const response = await updateAgentInJobApi(
    nodeAddress,
    jobId,
    newAgentId,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
    {
      my_device_encryption_sk: my_device_encryption_sk,
      my_device_identity_sk: my_device_identity_sk,
      node_encryption_pk: node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );

  return response;
};
