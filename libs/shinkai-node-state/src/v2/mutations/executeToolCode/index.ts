import { executeToolCode as executeToolCodeApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';
import { DynamicToolType } from '@shinkai_network/shinkai-message-ts/api/tools/types';

import { ExecuteToolCodeInput } from './types';

export const executeToolCode = async ({
  nodeAddress,
  token,
  code,
  params,
}: ExecuteToolCodeInput) => {
  const parameters = params.reduce(
    (acc: Record<string, any>, obj: Record<string, any>) => {
      return { ...acc, ...obj };
    },
    {} as Record<string, any>,
  );

  return await executeToolCodeApi(nodeAddress, token, {
    tool_type: DynamicToolType.DenoDynamic,
    code,
    parameters: parameters,
  });
};
