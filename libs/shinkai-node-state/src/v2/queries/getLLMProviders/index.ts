import { getLLMProviders as getLLMProvidersAPI } from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import type { GetLLMProvidersInput } from './types';

const EMBEDDING_MODEL = 'ollama:snowflake-arctic-embed:xs';

export const getLLMProviders = async ({
  nodeAddress,
  token,
}: GetLLMProvidersInput) => {
  const result = await getLLMProvidersAPI(nodeAddress, token);

  const filteredProviders = result.filter(
    (provider) => provider.model !== EMBEDDING_MODEL,
  );

  return filteredProviders;
};
