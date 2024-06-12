import { addAgent } from '@shinkai_network/shinkai-message-ts/api';

import { CreateAgentInput } from './types';

export const createAgent = async (data: CreateAgentInput) => {
  const {
    nodeAddress,
    sender_subidentity,
    node_name,
    agent,
    setupDetailsState,
  } = data;
  return await addAgent(
    nodeAddress,
    sender_subidentity,
    node_name,
    agent,
    setupDetailsState,
  );
};
