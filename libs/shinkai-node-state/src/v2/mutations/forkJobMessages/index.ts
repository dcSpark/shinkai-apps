import { forkJobMessages as forkJobMessagesApi } from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { type ForkJobMessagesInput } from './types';

export const forkJobMessages = async ({
  nodeAddress,
  token,
  jobId,
  messageId,
}: ForkJobMessagesInput) => {
  return await forkJobMessagesApi(nodeAddress, token, {
    message_id: messageId,
    job_id: jobId,
  });
};
