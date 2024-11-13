import { toolMetadataImplementation as createToolMetadataApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { CreateToolMetadataInput } from './types';

export const createToolMetadata = async ({
  nodeAddress,
  token,
  llmProviderId,
  message,
  code,
}: CreateToolMetadataInput) => {
  return await createToolMetadataApi(nodeAddress, token, {
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
