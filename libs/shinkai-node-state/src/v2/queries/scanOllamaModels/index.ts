import { scanOllamaModels as scanOllamaModelsApi } from '@shinkai_network/shinkai-message-ts/api/ollama';

import { ScanOllamaModelsInput } from './types';

export const scanOllamaModels = async ({
  nodeAddress,
  token,
}: ScanOllamaModelsInput) => {
  const response = await scanOllamaModelsApi(nodeAddress, token);
  const uniqueModels = response.filter(
    (model, index, self) =>
      index === self.findIndex((t) => t.model === model.model),
  );
  return uniqueModels;
};
