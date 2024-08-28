import { getTools as getToolsApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { GetToolsListInput } from './types';

export const getTools = async ({ nodeAddress, token }: GetToolsListInput) => {
  const response = await getToolsApi(nodeAddress, token);
  return response;
};
