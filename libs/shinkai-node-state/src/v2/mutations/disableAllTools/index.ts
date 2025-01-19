import { disableAllTools as disableAllToolsApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { DisableAllToolsInput } from './types';

export const disableAllTools = async ({
  nodeAddress,
  token,
}: DisableAllToolsInput) => {
  return await disableAllToolsApi(nodeAddress, token);
};
