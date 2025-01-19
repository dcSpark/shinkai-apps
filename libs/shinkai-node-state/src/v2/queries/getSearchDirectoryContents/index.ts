import { getSearchDirectoryContents as getSearchDirectoryContentsApi } from '@shinkai_network/shinkai-message-ts/api/vector-fs/index';

import { GetSearchDirectoryContentsInput } from './types';

export const getSearchDirectoryContents = async ({
  nodeAddress,
  token,
  name,
}: GetSearchDirectoryContentsInput) => {
  const response = await getSearchDirectoryContentsApi(nodeAddress, token, {
    name,
  });
  return response;
};
