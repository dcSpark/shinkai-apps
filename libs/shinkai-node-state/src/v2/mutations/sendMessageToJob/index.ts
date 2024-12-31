import {
  sendMessageToJob as sendMessageToJobApi,
  uploadFilesToJob,
} from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { SendMessageToJobInput } from './types';

export const sendMessageToJob = async ({
  nodeAddress,
  token,
  jobId,
  message,
  parent,
  files,
  toolKey,
}: SendMessageToJobInput) => {
  if (files && files.length > 0) {
    await uploadFilesToJob(nodeAddress, token, jobId, files);
  }

  return await sendMessageToJobApi(nodeAddress, token, {
    job_message: {
      content: message,
      job_id: jobId,
      parent: parent,
      tool_key: toolKey,
      files: [],
    },
  });
};
