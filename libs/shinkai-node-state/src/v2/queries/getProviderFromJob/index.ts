import { getProviderFromJob as getProviderFromJobApi } from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { type GetProviderFromJobInput } from './types';

export const getProviderFromJob = async ({
  nodeAddress,
  token,
  jobId,
}: GetProviderFromJobInput) => {
  const result = await getProviderFromJobApi(nodeAddress, token, {
    job_id: jobId,
  });
  return result;
};
