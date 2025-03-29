import { toolMetadataImplementation as createToolMetadataApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';
import { CodeLanguage } from '@shinkai_network/shinkai-message-ts/api/tools/types';

import { CreateToolMetadataInput, CreateToolMetadataOutput } from './types';

export const createToolMetadata = async ({
  nodeAddress,
  token,
  jobId,
  tools,
  xShinkaiToolId,
}: CreateToolMetadataInput): Promise<CreateToolMetadataOutput> => {
  const response = await createToolMetadataApi(nodeAddress, token, {
    job_id: jobId,
    language: CodeLanguage.Typescript,
    tools,
    x_shinkai_tool_id: xShinkaiToolId,
  });
  return response;
};
