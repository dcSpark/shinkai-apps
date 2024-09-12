import { getJobConfig as getJobConfigApi } from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { GetChatConfigInput } from './types';

export const getChatConfig = async ({
  nodeAddress,
  token,
  jobId,
}: GetChatConfigInput) => {
  const response = await getJobConfigApi(nodeAddress, token, {
    job_id: jobId,
  });
  return response;
};
