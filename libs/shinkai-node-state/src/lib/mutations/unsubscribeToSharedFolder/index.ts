import { unsubscribeToSharedFolder as unsubscribeToSharedFolderAPI } from '@shinkai_network/shinkai-message-ts/api';

import { UnsubscribeToSharedFolderInput } from './types';

export const unsubscribeToSharedFolder = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  folderPath,
  streamerNodeName,
  streamerNodeProfile,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: UnsubscribeToSharedFolderInput) => {
  return await unsubscribeToSharedFolderAPI(
    nodeAddress,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
    folderPath,
    streamerNodeName,
    streamerNodeProfile,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );
};
