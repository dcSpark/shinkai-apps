import {
  addLLMProvider as addLLMProviderAPI,
  testLLMProvider,
} from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { AddLLMProviderInput } from './types';

export const addLLMProvider = async ({
  nodeAddress,
  token,
  agent,
}: AddLLMProviderInput) => {
  if (!agent.model.Ollama) {
    await testLLMProvider(nodeAddress, token, agent);
  }

  const data = await addLLMProviderAPI(nodeAddress, token, agent);
  return data;
};
