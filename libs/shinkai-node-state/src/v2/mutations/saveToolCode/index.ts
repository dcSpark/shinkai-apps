import {
  saveToolCode as saveToolCodeApi,
  toggleEnableTool,
} from '@shinkai_network/shinkai-message-ts/api/tools/index';
import {} from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { merge } from 'ts-deepmerge';

import { SaveToolCodeInput } from './types';

export const saveToolCode = async ({
  nodeAddress,
  token,
  jobId,
  name,
  description,
  version,
  metadata,
  code,
  language,
  assets,
  tools,
  xShinkaiAppId,
  xShinkaiToolId,
  xShinkaiOriginalToolRouterKey,
  author,
}: SaveToolCodeInput) => {
  const mergedToolMetadata = merge(metadata, {
    name,
    description,
    version,
    tools,
    author,
  });

  const response = await saveToolCodeApi(
    nodeAddress,
    token,
    {
      code: code ?? '',
      metadata: mergedToolMetadata,
      job_id: jobId,
      language,
      assets,
    },
    xShinkaiAppId,
    xShinkaiToolId,
    xShinkaiOriginalToolRouterKey,
  );

  if (
    response.metadata.tool_router_key &&
    Object.keys(metadata?.configurations?.properties ?? {}).length === 0
  ) {
    await toggleEnableTool(nodeAddress, token, {
      tool_router_key: response.metadata.tool_router_key,
      enabled: true,
    });
  }

  return response;
};
