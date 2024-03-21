import { deleteItemVR } from '@shinkai_network/shinkai-message-ts/api';

import { DeleteVRItemInput } from './types';

export const deleteVRItem = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  itemPath,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: DeleteVRItemInput) => {
  return await deleteItemVR(
    nodeAddress,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
    itemPath,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );
};
