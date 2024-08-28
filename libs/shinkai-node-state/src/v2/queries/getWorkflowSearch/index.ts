import { searchWorkflows as getWorkflowSearchApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { GetWorkflowSearchInput } from './types';

export const getWorkflowSearch = async ({
  nodeAddress,
  token,
  search,
}: GetWorkflowSearchInput) => {
  const response = await getWorkflowSearchApi(nodeAddress, token, search);
  return response;
};
