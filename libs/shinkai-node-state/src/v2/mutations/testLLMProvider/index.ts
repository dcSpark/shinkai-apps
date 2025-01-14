import {
  addLLMProvider as addLLMProviderAPI,
  testLLMProvider as testLLMProviderApi,
} from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { TestLLMProviderInput } from './types';

export const testLLMProvider = async ({
  nodeAddress,
  token,
  agent,
}: TestLLMProviderInput) => {
  const response = await testLLMProviderApi(nodeAddress, token, agent);
  return response;
};
