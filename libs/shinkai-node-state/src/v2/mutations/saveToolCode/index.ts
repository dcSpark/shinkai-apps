import { saveToolCode as saveToolCodeApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';
import { updateTool as updateToolApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';
import {
  CodeLanguage,
  ShinkaiTool,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';
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
}: SaveToolCodeInput) => {
  const mergedToolMetadata = merge(metadata, {
    name,
    description,
    version,
    tools,
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
  );

  if (
    response.metadata.tool_router_key &&
    Object.keys(metadata?.configurations?.properties ?? {}).length === 0
  ) {
    await updateToolApi(nodeAddress, token, response.metadata.tool_router_key, {
      content: [{} as ShinkaiTool, true],
      type:
        language === CodeLanguage.Typescript
          ? 'Deno'
          : language === CodeLanguage.Python
            ? 'Python'
            : 'Rust', // TODO: add Rust support
    });
  }

  return response;
};
