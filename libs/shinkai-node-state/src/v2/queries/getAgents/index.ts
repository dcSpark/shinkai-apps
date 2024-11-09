import { getAgents as getAgentsApi } from '@shinkai_network/shinkai-message-ts/api/agents/index';

import type { GetAgentsInput } from './types';

export const getAgents = async ({ nodeAddress, token }: GetAgentsInput) => {
  const result = await getAgentsApi(nodeAddress, token);
  return result;
};
