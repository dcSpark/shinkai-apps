import { getAgent as getAgentApi } from '@shinkai_network/shinkai-message-ts/api/agents/index';

import type { GetAgentInput } from './types';

export const getAgent = async ({
  nodeAddress,
  token,
  agentId,
}: GetAgentInput) => {
  const result = await getAgentApi(nodeAddress, token, {
    agentId,
  });
  return result;
};
