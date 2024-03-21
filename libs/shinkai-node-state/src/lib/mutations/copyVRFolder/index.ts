import { copyFolderVR } from '@shinkai_network/shinkai-message-ts/api';

import { CopyVRFolderInput } from './types';

export const copyVRFolder = async ({
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
}: CopyVRFolderInput) => {
  return await copyFolderVR(
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
