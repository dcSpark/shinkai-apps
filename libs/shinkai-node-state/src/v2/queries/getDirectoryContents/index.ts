import { getListDirectoryContents as getListDirectoryContentsApi } from '@shinkai_network/shinkai-message-ts/api/vector-fs/index';

import { GetVRPathSimplifiedInput } from './types';

export const getListDirectoryContents = async ({
  nodeAddress,
  path,
  token,
}: GetVRPathSimplifiedInput) => {
  const response = await getListDirectoryContentsApi(nodeAddress, token, {
    path: path,
  });

  return response;
};
