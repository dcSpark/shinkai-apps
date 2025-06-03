import { updateToolCodeImplementation as updateToolCodeImplementationApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { type UpdateToolCodeImplementationInput } from './types';

export const updateToolCodeImplementation = async ({
  nodeAddress,
  token,
  jobId,
  code,
}: UpdateToolCodeImplementationInput) => {
  return await updateToolCodeImplementationApi(nodeAddress, token, {
    job_id: jobId,
    code,
  });
};
