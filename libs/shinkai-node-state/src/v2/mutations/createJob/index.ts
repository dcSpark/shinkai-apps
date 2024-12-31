import {
  createJob as createJobApi,
  sendMessageToJob,
  updateChatConfig,
  uploadFilesToJob,
} from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { CreateJobInput } from './types';

export const createJob = async ({
  nodeAddress,
  token,
  llmProvider,
  sheetId,
  content,
  toolKey,
  isHidden,
  files,
  selectedVRFiles,
  selectedVRFolders,
  chatConfig,
}: CreateJobInput) => {
  const { job_id: jobId } = await createJobApi(nodeAddress, token, {
    llm_provider: llmProvider,
    job_creation_info: {
      scope: {
        vector_fs_items: selectedVRFiles ?? [],
        vector_fs_folders: selectedVRFolders ?? [],
      },
      associated_ui: sheetId ? { Sheet: sheetId } : null,
      is_hidden: isHidden,
    },
  });

  if (chatConfig) {
    await updateChatConfig(nodeAddress, token, {
      job_id: jobId,
      config: chatConfig,
    });
  }

  if (files && files.length > 0) {
    await uploadFilesToJob(nodeAddress, token, jobId, files);
  }

  await sendMessageToJob(nodeAddress, token, {
    job_message: {
      content,
      job_id: jobId,
      parent: '',
      tool_key: toolKey,
    },
  });

  return { jobId };
};
