import { unshareFolder as unshareFolderAPI } from '@shinkai_network/shinkai-message-ts/api';

import { UnshareFolderInput } from './types';

export const unshareFolder = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  folderPath,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: UnshareFolderInput) => {
  return await unshareFolderAPI(
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
