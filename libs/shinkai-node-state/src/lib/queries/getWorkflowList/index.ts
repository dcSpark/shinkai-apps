import { getWorkflowList as getWorkflowListAPI } from '@shinkai_network/shinkai-message-ts/api';

import { GetWorkflowListInput, GetWorkflowListOutput } from './types';

export const getWorkflowList = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: GetWorkflowListInput): Promise<GetWorkflowListOutput> => {
  const response = await getWorkflowListAPI(
    nodeAddress,
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

  return response.data;
};
