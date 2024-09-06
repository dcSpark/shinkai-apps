import { getMySharedFolders as getMySharedFoldersAPI } from '@shinkai_network/shinkai-message-ts/api/subscriptions/index';

import { GetMySharedFoldersInput, GetMyShareFoldersOutput } from './types';

export const getMySharedFolders = async ({
  nodeAddress,
  token,
}: GetMySharedFoldersInput) => {
  const response = await getMySharedFoldersAPI(nodeAddress, token);
  return response;
};
