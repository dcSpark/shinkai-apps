import { getAgents as getAgentsApi } from '@shinkai_network/shinkai-message-ts/api/agents/index';

import type { GetAgentsInput } from './types';

export const getAgents = async ({
  nodeAddress,
  token,
  categoryFilter,
}: GetAgentsInput) => {
  const result = await getAgentsApi(nodeAddress, token, categoryFilter);
  return result;
};
