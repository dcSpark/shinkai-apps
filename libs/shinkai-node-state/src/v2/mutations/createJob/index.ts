import {
  createJob as createJobApi,
  sendMessageToJob,
  uploadFilesToInbox,
} from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { CreateJobInput } from './types';

export const createJob = async ({
  nodeAddress,
  token,
  llmProvider,
  sheetId,
  content,
  isHidden,
  workflowName,
  workflowCode,
  files,
  selectedVRFiles,
  selectedVRFolders,
}: CreateJobInput) => {
  const { job_id: jobId } = await createJobApi(nodeAddress, token, {
    llm_provider: llmProvider,
    job_creation_info: {
      scope: {
        vector_fs_items: (selectedVRFiles ?? [])?.map((vfFile) => ({
          path: vfFile.path,
          name: vfFile.vr_header.resource_name,
          source: vfFile.vr_header.resource_source,
        })),
        vector_fs_folders: (selectedVRFolders ?? [])?.map((vfFolder) => ({
          path: vfFolder.path,
          name: vfFolder.name,
        })),
        local_vrpack: [],
        local_vrkai: [],
        network_folders: [],
      },
      associated_ui: sheetId ? { Sheet: sheetId } : null,
      is_hidden: isHidden,
    },
  });

  let folderId = '';
  if (files && files.length > 0) {
    folderId = await uploadFilesToInbox(nodeAddress, token, files);
  }

  await sendMessageToJob(nodeAddress, token, {
    job_message: {
      workflow_code: workflowCode,
      content,
      workflow_name: workflowName,
      job_id: jobId,
      files_inbox: folderId,
      parent: '',
    },
  });

  return { jobId };
};
