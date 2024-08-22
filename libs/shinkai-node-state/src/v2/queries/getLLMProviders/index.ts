import { getLLMProviders as getLLMProvidersAPI } from '@shinkai_network/shinkai-message-ts/api/v2/methods';

import type { GetLLMProvidersInput } from './types';

export const getLLMProviders = async ({
  nodeAddress,
}: GetLLMProvidersInput) => {
  const result = await getLLMProvidersAPI(nodeAddress);
  return result;
};
