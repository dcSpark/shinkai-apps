import { saveToolCode as saveToolCodeApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { SaveToolCodeInput } from './types';

export const saveToolCode = async ({
  nodeAddress,
  token,
  jobId,
  metadata,
  code,
}: SaveToolCodeInput) => {
  return await saveToolCodeApi(nodeAddress, token, {
    code: code ?? '',
    metadata,
    job_id: jobId,
  });
};
