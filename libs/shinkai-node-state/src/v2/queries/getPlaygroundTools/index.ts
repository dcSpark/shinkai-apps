import { getPlaygroundTools as getPlaygroundToolsApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { type GetPlaygroundToolsInput } from './types';

export const getPlaygroundTools = async ({
  nodeAddress,
  token,
}: GetPlaygroundToolsInput) => {
  const response = await getPlaygroundToolsApi(nodeAddress, token);
  return response;
};
