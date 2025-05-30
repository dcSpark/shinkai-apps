import { executeToolCode as executeToolCodeApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';
import {
  CodeLanguage,
  DynamicToolType,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';

import { type ExecuteToolCodeInput } from './types';

export const executeToolCode = async ({
  nodeAddress,
  token,
  code,
  params,
  llmProviderId,
  tools,
  language,
  configs,
  xShinkaiAppId,
  xShinkaiToolId,
  mounts,
}: ExecuteToolCodeInput) => {
  const toolTypeLanguageMap = {
    [CodeLanguage.Python]: DynamicToolType.PythonDynamic,
    [CodeLanguage.Typescript]: DynamicToolType.DenoDynamic,
    [CodeLanguage.MCPServer]: DynamicToolType.MCPServerDynamic,
    Agent: DynamicToolType.AgentDynamic,
  };

  return await executeToolCodeApi(
    nodeAddress,
    token,
    {
      tool_type: toolTypeLanguageMap[language],
      code,
      parameters: params ?? {},
      llm_provider: llmProviderId,
      tools,
      extra_config: configs,
      mounts,
    },
    xShinkaiAppId,
    xShinkaiToolId,
  );
};
