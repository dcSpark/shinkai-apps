import { executeToolCode as executeToolCodeApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { ExecuteToolCodeInput } from './types';

export const executeToolCode = async ({
  nodeAddress,
  token,
  code,
  params,
}: ExecuteToolCodeInput) => {
  return await executeToolCodeApi(nodeAddress, token, {
    tool_type: 'denodynamic',
    code,
    parameters: params,
  });
};
