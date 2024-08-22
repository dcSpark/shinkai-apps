import { searchWorkflows as getWorkflowSearchApi } from '@shinkai_network/shinkai-message-ts/api/workflow/index';

import { GetWorkflowSearchInput, GetWorkflowSearchOutput } from './types';

export const getWorkflowSearch = async ({
  nodeAddress,
  search,
}: GetWorkflowSearchInput): Promise<GetWorkflowSearchOutput> => {
  const response = await getWorkflowSearchApi(nodeAddress, search);
  return response;
};
