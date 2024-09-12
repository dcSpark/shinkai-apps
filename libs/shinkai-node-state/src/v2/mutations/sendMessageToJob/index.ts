import {
  sendMessageToJob as sendMessageToJobApi,
  uploadFilesToInbox,
} from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { SendMessageToJobInput } from './types';

export const sendMessageToJob = async ({
  nodeAddress,
  token,
  jobId,
  message,
  parent,
  files,
  workflowCode,
  workflowName,
}: SendMessageToJobInput) => {
  let folderId = '';
  if (files && files.length > 0) {
    folderId = await uploadFilesToInbox(nodeAddress, token, files);
  }

  return await sendMessageToJobApi(nodeAddress, token, {
    job_message: {
      workflow_code: workflowCode,
      content: message,
      workflow_name: workflowName,
      job_id: jobId,
      files_inbox: folderId,
      parent: parent,
    },
  });
};
