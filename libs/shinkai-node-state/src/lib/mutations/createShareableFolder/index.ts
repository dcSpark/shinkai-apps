import { createShareableFolder as createShareableFolderAPI } from '@shinkai_network/shinkai-message-ts/api';

import { CreateShareableFolderInput } from './types';

export const createShareableFolder = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  folderPath,
  folderDescription,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: CreateShareableFolderInput) => {
  return await createShareableFolderAPI(
    nodeAddress,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
    folderPath,
    folderDescription,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );
};
