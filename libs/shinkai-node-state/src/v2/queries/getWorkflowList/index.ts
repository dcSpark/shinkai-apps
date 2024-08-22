import { listAllWorkflows as getWorkflowListAPI } from '@shinkai_network/shinkai-message-ts/api/v2/methods';

import { GetWorkflowListInput } from './types';

export const getWorkflowList = async ({
  nodeAddress,
}: GetWorkflowListInput) => {
  const response = await getWorkflowListAPI(nodeAddress);
  return response;
};
