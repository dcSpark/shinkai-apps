import { saveToolCode as saveToolCodeApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';
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

  return await saveToolCodeApi(
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
};
