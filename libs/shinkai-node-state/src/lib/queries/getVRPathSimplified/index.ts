import { retrieveVRPathSimplified as retrieveVRPathSimplifiedApi } from '@shinkai_network/shinkai-message-ts/api';

import { GetVRPathSimplifiedInput, VRFolder } from './types';

export const getVRPathSimplified = async ({
  nodeAddress,
  path,
  shinkaiIdentity,
  profile,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: GetVRPathSimplifiedInput): Promise<VRFolder> => {
  const response = await retrieveVRPathSimplifiedApi(
    nodeAddress,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
    path,
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
