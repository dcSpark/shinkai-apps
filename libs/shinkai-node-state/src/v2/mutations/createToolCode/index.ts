import { createToolCode as createToolCodeApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { CreateToolCodeInput } from './types';

export const createToolCode = async ({
  nodeAddress,
  token,
  llmProviderId,
}: CreateToolCodeInput) => {
  return await createToolCodeApi(nodeAddress, token, {
    raw: false,
    code: '',
    metadata: '',
    output: '',
    fetch_query: false,
    language: 'Typescript',
    prompt:
      'Generate a tool that downloads https://jhftss.github.io/ and convert to plain text',
    llm_provider: llmProviderId,
  });
};
