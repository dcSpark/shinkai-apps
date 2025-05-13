import { importAgentFromUrl as importAgentFromUrlApi } from '@shinkai_network/shinkai-message-ts/api/agents/index';

import { ImportAgentFromUrlInput } from './types';

export const importAgentFromUrl = async ({
  nodeAddress,
  token,
  url,
}: ImportAgentFromUrlInput) => {
  return await importAgentFromUrlApi(nodeAddress, token, url);
};
