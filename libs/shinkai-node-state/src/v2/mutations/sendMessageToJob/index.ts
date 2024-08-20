import { sendMessageToJob as sendMessageToJobApi } from '@shinkai_network/shinkai-message-ts/api/v2/methods';

import { SendMessageToJobInput } from './types';

export const sendMessageToJob = async ({
  nodeAddress,
  jobId,
  message,
  parent,
  workflowCode,
  workflowName,
}: SendMessageToJobInput) => {
  return await sendMessageToJobApi(nodeAddress, {
    job_message: {
      workflow_code: workflowCode,
      content: message,
      workflow_name: workflowName,
      job_id: jobId,
      files_inbox: '',
      parent: parent,
    },
  });
};
