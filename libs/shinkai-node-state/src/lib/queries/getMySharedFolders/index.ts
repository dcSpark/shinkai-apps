import { getMySharedFolders as getMySharedFoldersAPI } from '@shinkai_network/shinkai-message-ts/api';

import { GetMySharedFoldersInput, GetMyShareFoldersOutput } from './types';

export const getMySharedFolders = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: GetMySharedFoldersInput): Promise<GetMyShareFoldersOutput> => {
  const response = await getMySharedFoldersAPI(
    nodeAddress,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );
  return response.data;
};
