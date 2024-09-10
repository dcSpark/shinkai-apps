import { updateChatConfig as updateChatConfigApi } from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { UpdateChatConfigInput } from './types';

export const updateChatConfig = async ({
  nodeAddress,
  token,
  jobId,
  jobConfig,
}: UpdateChatConfigInput) => {
  const response = await updateChatConfigApi(nodeAddress, token, {
    job_id: jobId,
    config: jobConfig,
  });
  return response;
};
