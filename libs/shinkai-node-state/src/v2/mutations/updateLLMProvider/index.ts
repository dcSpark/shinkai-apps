import { updateLLMProvider as updateLLMProviderApi } from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { UpdateLLMProviderInput } from './types';

export const updateLLMProvider = async ({
  nodeAddress,
  token,
  agent,
}: UpdateLLMProviderInput) => {
  const data = await updateLLMProviderApi(nodeAddress, token, agent);
  return data;
};
