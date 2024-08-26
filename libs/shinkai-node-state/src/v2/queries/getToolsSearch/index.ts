import { searchTools as searchToolsApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { GetSearchToolsInput, GetSearchToolsOutput } from './types';

export const searchTools = async ({
  nodeAddress,
  search,
}: GetSearchToolsInput): Promise<GetSearchToolsOutput> => {
  const response = await searchToolsApi(nodeAddress, search);

  return response;
};
