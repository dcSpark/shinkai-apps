import { moveFolderVR } from '@shinkai_network/shinkai-message-ts/api';

import { MoveVRFolderInput } from './types';

export const moveVRFolder = async ({
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
}: MoveVRFolderInput) => {
  return await moveFolderVR(
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
