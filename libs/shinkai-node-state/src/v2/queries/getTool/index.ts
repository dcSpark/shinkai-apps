import { getTool as getToolApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { GetToolInput, GetToolOutput } from './types';

export const getTool = async ({
  nodeAddress,
  toolKey,
}: GetToolInput): Promise<GetToolOutput> => {
  const response = await getToolApi(nodeAddress, toolKey);
  return response;
};
