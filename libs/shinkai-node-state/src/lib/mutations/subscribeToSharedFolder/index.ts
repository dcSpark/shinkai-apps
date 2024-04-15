import { subscribeToSharedFolder as subscribeToSharedFolderAPI } from '@shinkai_network/shinkai-message-ts/api';

import { SubscribeToSharedFolderInput } from './types';

export const subscribeToSharedFolder = async ({
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
}: SubscribeToSharedFolderInput) => {
  return await subscribeToSharedFolderAPI(
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
