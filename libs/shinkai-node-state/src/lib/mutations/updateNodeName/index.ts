import { updateNodeName as updateNodeNameApi } from '@shinkai_network/shinkai-message-ts/api';

import { UpdateNodeNameInput, UpdateNodeNameOutput } from './types';

export const updateNodeName = async ({
  nodeAddress,
  newNodeName,
  shinkaiIdentity,
  profile,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: UpdateNodeNameInput): Promise<UpdateNodeNameOutput> => {
  const response = await updateNodeNameApi(
    nodeAddress,
    newNodeName,
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
