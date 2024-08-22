import { addLLMProvider as addLLMProviderAPI } from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { AddLLMProviderInput } from './types';

export const addLLMProvider = async ({
  nodeAddress,
  agent,
}: AddLLMProviderInput) => {
  const data = await addLLMProviderAPI(nodeAddress, agent);
  return data;
};
