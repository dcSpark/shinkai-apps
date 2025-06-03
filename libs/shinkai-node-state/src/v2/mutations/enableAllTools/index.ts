import { enableAllTools as enableAllToolsApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { type EnableAllToolsInput } from './types';

export const enableAllTools = async ({
  nodeAddress,
  token,
}: EnableAllToolsInput) => {
  return await enableAllToolsApi(nodeAddress, token);
};
