import { getAvailableSharedFolders as getAvailableSharedFoldersAPI } from '@shinkai_network/shinkai-message-ts/api';

import {
  GetAvailableSharedItemsInput,
  GetAvailableSharedItemsOutput,
} from './types';

export const getAvailableSharedFolders = async ({
  pageSize,
  page,
  priceFilter,
  search,
}: GetAvailableSharedItemsInput): Promise<GetAvailableSharedItemsOutput> => {
  const response = await getAvailableSharedFoldersAPI(
    pageSize,
    page,
    priceFilter,
    search,
  );
  return response;
};
