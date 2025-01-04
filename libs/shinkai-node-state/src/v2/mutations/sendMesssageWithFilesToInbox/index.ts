import { sendTextMessageWithFilesToJob } from '@shinkai_network/shinkai-message-ts/api';

import { SendMessageWithFilesToInboxInput } from './types';

export const sendMessageWithFilesToJob = async ({
  nodeAddress,
  token,
  message,
  jobId,
  files,
}: SendMessageWithFilesToInboxInput) => {
  return await sendTextMessageWithFilesToJob(
    nodeAddress,
    message,
    jobId,
    files,
    token,
  );
};
