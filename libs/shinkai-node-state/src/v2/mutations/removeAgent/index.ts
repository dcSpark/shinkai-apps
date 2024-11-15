import { removeAgent as removeAgentApi } from '@shinkai_network/shinkai-message-ts/api/agents/index';

import { RemoveAgentInput } from './types';

export const removeAgent = async ({
  nodeAddress,
  token,
  agentId,
}: RemoveAgentInput) => {
  const data = await removeAgentApi(nodeAddress, token, {
    agent_id: agentId,
  });
  return data;
};
