import { getMySharedFolders as getMySharedFoldersAPI } from '@shinkai_network/shinkai-message-ts/api/subscriptions/index';

import { GetMySharedFoldersInput, GetMyShareFoldersOutput } from './types';

export const getMySharedFolders = async ({
  nodeAddress,
  token,
  shinkaiIdentity,
  profile,
}: GetMySharedFoldersInput) => {
  const response = await getMySharedFoldersAPI(nodeAddress, token, {
    path: '/',
    streamer_node_name: shinkaiIdentity,
    streamer_profile_name: profile,
  });
  return response;
};
