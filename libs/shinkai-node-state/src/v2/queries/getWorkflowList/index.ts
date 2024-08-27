import { listAllWorkflows as getWorkflowListAPI } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { GetWorkflowListInput } from './types';

export const getWorkflowList = async ({
  nodeAddress,
  token,
}: GetWorkflowListInput) => {
  const response = await getWorkflowListAPI(nodeAddress, token);
  return response;
};
