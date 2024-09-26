import { removeLLMProvider as removeLLMProviderApi } from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { RemoveLLMProviderInput } from './types';

export const removeLLMProvider = async ({
  nodeAddress,
  token,
  llmProviderId,
}: RemoveLLMProviderInput) => {
  const data = await removeLLMProviderApi(nodeAddress, token, {
    llm_provider_id: llmProviderId,
  });
  return data;
};
