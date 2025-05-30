import {
  addOllamaModels,
  scanOllamaModels,
} from '@shinkai_network/shinkai-message-ts/api/ollama';

import { type SyncOllamaModelsInput } from './types';

export const syncOllamaModels = async ({
  nodeAddress,
  token,
  allowedModels,
}: SyncOllamaModelsInput) => {
  let ollamaModels = await scanOllamaModels(nodeAddress, token);
  if (!ollamaModels?.length) {
    return;
  }
  if (allowedModels?.length) {
    ollamaModels = ollamaModels.filter((model) =>
      allowedModels.includes(model.model),
    );
  }
  const payload = {
    models: ollamaModels.map((v) => v.model),
  };
  return addOllamaModels(nodeAddress, token, payload);
};
