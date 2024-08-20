import {
  createJob as createJobApi,
  sendMessageToJob,
} from '@shinkai_network/shinkai-message-ts/api/v2/methods';

import { CreateJobInput } from './types';

export const createJob = async ({
  nodeAddress,
  llmProvider,
  sheetId,
  content,
  isHidden,
  workflowName,
  workflowCode,
}: CreateJobInput) => {
  const { job_id: jobId } = await createJobApi(nodeAddress, {
    llm_provider: llmProvider,
    job_creation_info: {
      scope: {
        network_folders: [],
        vector_fs_folders: [],
        vector_fs_items: [],
        local_vrpack: [],
        local_vrkai: [],
      },
      associated_ui: {
        Sheet: sheetId,
      },
      is_hidden: isHidden,
    },
  });

  await sendMessageToJob(nodeAddress, {
    job_message: {
      workflow_code: workflowCode,
      content,
      workflow_name: workflowName,
      job_id: jobId,
      files_inbox: '',
      parent: '',
    },
  });

  return {
    jobId,
  };
};
