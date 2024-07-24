import { getWorkflowSearch as getWorkflowSearchApi } from '@shinkai_network/shinkai-message-ts/api';

import { GetWorkflowSearchInput, GetWorkflowSearchOutput } from './types';

export const getWorkflowSearch = async ({
  nodeAddress,
  search,
  shinkaiIdentity,
  profile,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: GetWorkflowSearchInput): Promise<GetWorkflowSearchOutput> => {
  const response = await getWorkflowSearchApi(
    nodeAddress,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
    search,
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
