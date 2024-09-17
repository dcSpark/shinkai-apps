import { searchPrompt as searchPromptApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { GetPromptSearchInput } from './types';

export const getPromptSearch = async ({
  nodeAddress,
  token,
  search,
}: GetPromptSearchInput) => {
  const response = await searchPromptApi(nodeAddress, token, search);
  return response;
};
