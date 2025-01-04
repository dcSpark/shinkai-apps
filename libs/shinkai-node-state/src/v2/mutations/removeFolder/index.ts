import { removeFolder as removeFolderApi } from '@shinkai_network/shinkai-message-ts/api/vector-fs/index';

import { RemoveFolderInput } from './types';

export const removeFolder = async ({
  nodeAddress,
  token,
  folderPath,
}: RemoveFolderInput) => {
  return await removeFolderApi(nodeAddress, token, {
    path: folderPath,
  });
};
