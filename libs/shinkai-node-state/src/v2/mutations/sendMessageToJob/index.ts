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
  let filePaths: string[] = [];
  if (files && files.length > 0) {
    const uploadResponses = await uploadFilesToJob(nodeAddress, token, jobId, files);
    filePaths = uploadResponses.map(response => response.path);
  }

  return await sendMessageToJobApi(nodeAddress, token, {
    job_message: {
      content: message,
      job_id: jobId,
      parent: parent,
      tool_key: toolKey,
      files: filePaths,
    },
  });
};
