import {
  addLLMProvider as addLLMProviderAPI,
  testLLMProvider,
} from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { type AddLLMProviderInput } from './types';

export const addLLMProvider = async ({
  nodeAddress,
  token,
  agent,
  enableTest,
}: AddLLMProviderInput) => {
  if (!agent.model.Ollama || enableTest) {
    await testLLMProvider(nodeAddress, token, agent);
  }
  const data = await addLLMProviderAPI(nodeAddress, token, agent);
  return data;
};
