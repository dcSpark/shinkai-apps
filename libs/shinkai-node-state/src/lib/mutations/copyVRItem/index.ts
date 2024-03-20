import { copyItemVR } from '@shinkai_network/shinkai-message-ts/api';

import { CopyVRItemInput } from './types';

export const copyVRItem = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  originPath,
  destinationPath,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: CopyVRItemInput) => {
  return await copyItemVR(
    nodeAddress,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
    originPath,
    destinationPath,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );
};
