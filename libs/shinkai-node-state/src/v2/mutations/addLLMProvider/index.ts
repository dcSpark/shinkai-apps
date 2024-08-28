import { addLLMProvider as addLLMProviderAPI } from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { AddLLMProviderInput } from './types';

export const addLLMProvider = async ({
  nodeAddress,
  token,
  agent,
}: AddLLMProviderInput) => {
  const data = await addLLMProviderAPI(nodeAddress, token, agent);
  return data;
};
