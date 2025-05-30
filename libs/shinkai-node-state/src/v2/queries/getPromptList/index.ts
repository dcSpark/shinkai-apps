import { getAllPrompts as getPromptListAPI } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { type GetPromptListInput } from './types';

export const getPromptList = async ({
  nodeAddress,
  token,
}: GetPromptListInput) => {
  const response = await getPromptListAPI(nodeAddress, token);
  return response;
};
