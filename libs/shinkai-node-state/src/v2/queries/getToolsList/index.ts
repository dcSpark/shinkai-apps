import { getTools as getToolsApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { GetToolsListInput, GetToolsListOutput } from './types';

export const getTools = async ({
  nodeAddress,
}: GetToolsListInput): Promise<GetToolsListOutput> => {
  const response = await getToolsApi(nodeAddress);
  return response;
};
