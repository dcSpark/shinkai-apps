import { addLLMProvider as addLLMProviderAPI } from '@shinkai_network/shinkai-message-ts/api';

import { AddLLMProviderInput } from './types';

export const addLLMProvider = async (data: AddLLMProviderInput) => {
  const {
    nodeAddress,
    sender_subidentity,
    node_name,
    agent,
    setupDetailsState,
  } = data;
  return await addLLMProviderAPI(
    nodeAddress,
    sender_subidentity,
    node_name,
    agent,
    setupDetailsState,
  );
};
