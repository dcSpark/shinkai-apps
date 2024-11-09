import { updateAgent as updateAgentApi } from '@shinkai_network/shinkai-message-ts/api/agents/index';

import { UpdateAgentInput } from './types';

export const updateAgent = async ({
  nodeAddress,
  token,
  agent,
}: UpdateAgentInput) => {
  const response = await updateAgentApi(nodeAddress, token, {
    ...agent,
  });
  return response;
};
