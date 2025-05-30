import { removeJob as removeJobApi } from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { type RemoveJobInput } from './types';

export const removeJob = async ({
  nodeAddress,
  token,
  jobId,
}: RemoveJobInput) => {
  return await removeJobApi(nodeAddress, token, {
    job_id: jobId,
  });
};
