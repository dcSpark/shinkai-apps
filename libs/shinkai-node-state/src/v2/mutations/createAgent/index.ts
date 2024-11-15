import { createAgent as createAgentApi } from '@shinkai_network/shinkai-message-ts/api/agents/index';

import { CreateAgentInput } from './types';

export const createAgent = async ({
  nodeAddress,
  token,
  agent,
}: CreateAgentInput) => {
  const response = await createAgentApi(nodeAddress, token, {
    ...agent,
  });
  return response;
};
