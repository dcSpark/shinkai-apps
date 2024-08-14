import { getTool as getToolAPI } from '@shinkai_network/shinkai-message-ts/api';

import { GetToolInput, GetToolOutput } from './types';

export const getTool = async ({
  nodeAddress,
  toolKey,
  shinkaiIdentity,
  profile,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: GetToolInput): Promise<GetToolOutput> => {
  const response = await getToolAPI(
    nodeAddress,
    toolKey,
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
