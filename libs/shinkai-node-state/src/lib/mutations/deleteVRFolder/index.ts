import { deleteFolderVR } from '@shinkai_network/shinkai-message-ts/api';

import { DeleteVRFolderInput } from './types';

export const deleteVRFolder = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  folderPath,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: DeleteVRFolderInput) => {
  return await deleteFolderVR(
    nodeAddress,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
    folderPath,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );
};
