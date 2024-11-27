import { executeToolCode as executeToolCodeApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';
import { DynamicToolType } from '@shinkai_network/shinkai-message-ts/api/tools/types';

import { ExecuteToolCodeInput } from './types';

export const executeToolCode = async ({
  nodeAddress,
  token,
  code,
  params,
  llmProviderId,
  tools,
}: ExecuteToolCodeInput) => {
  return await executeToolCodeApi(nodeAddress, token, {
    tool_type: DynamicToolType.DenoDynamic,
    code,
    parameters: params,
    llm_provider: llmProviderId,
    tools,
  });
};
