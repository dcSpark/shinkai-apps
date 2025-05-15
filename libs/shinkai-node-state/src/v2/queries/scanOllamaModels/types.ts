import { ScanOllamaModelsResponse } from '@shinkai_network/shinkai-message-ts/api/ollama';

export type ScanOllamaModelsInput = {
  nodeAddress: string;
  token: string;
};

export type ScanOllamaModelsOutput = ScanOllamaModelsResponse;
