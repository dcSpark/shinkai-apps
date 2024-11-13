import { toolImplementation as createToolCodeApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { CreateToolCodeInput } from './types';

export const createToolCode = async ({
  nodeAddress,
  token,
  llmProviderId,
  message,
  code,
}: CreateToolCodeInput) => {
  return await createToolCodeApi(nodeAddress, token, {
    raw: false,
    code: code ?? '',
    metadata: '',
    output: '',
    fetch_query: false,
    language: 'Typescript',
    prompt: message,
    llm_provider: llmProviderId,
  });
};
