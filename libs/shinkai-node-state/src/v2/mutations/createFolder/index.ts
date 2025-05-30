import { createFolder as createFolderApi } from '@shinkai_network/shinkai-message-ts/api/vector-fs/index';

import { type CreateFolderInput, type CreateFolderOutput } from './types';

export const createFolder = async ({
  nodeAddress,
  token,
  folderName,
  path,
}: CreateFolderInput): Promise<CreateFolderOutput> => {
  const response = await createFolderApi(nodeAddress, token, {
    folder_name: folderName,
    path,
  });

  return response;
};
