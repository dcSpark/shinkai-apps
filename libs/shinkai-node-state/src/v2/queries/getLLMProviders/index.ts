import { getLLMProviders as getLLMProvidersAPI } from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import type { GetLLMProvidersInput } from './types';

export const getLLMProviders = async ({
  nodeAddress,
  token,
}: GetLLMProvidersInput) => {
  const result = await getLLMProvidersAPI(nodeAddress, token);
  return result;
};
