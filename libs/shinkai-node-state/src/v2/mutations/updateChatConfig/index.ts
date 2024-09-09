import { updateChatConfig as updateChatConfigApi } from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { UpdateChatConfigInput } from './types';

export const updateChatConfig = async ({
  nodeAddress,
  token,
  jobId,
}: UpdateChatConfigInput) => {
  const response = await updateChatConfigApi(nodeAddress, token, {
    job_id: jobId,
    config: {
      stream: false,
      custom_prompt: '',
    },
  });
  return response;
};
