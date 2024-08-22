import {
  createJob as createJobApi,
  sendMessageToJob,
  uploadFilesToInbox,
} from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { CreateJobInput } from './types';

export const createJob = async ({
  nodeAddress,
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
  const { job_id: jobId } = await createJobApi(nodeAddress, {
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
      associated_ui: {
        Sheet: sheetId ?? '',
      },
      is_hidden: isHidden,
    },
  });

  let folderId = '';
  if (files) {
    folderId = await uploadFilesToInbox(nodeAddress, files);
  }

  await sendMessageToJob(nodeAddress, {
    job_message: {
      workflow_code: workflowCode,
      content,
      workflow_name: workflowName ?? '', // API V2 requires this field
      job_id: jobId,
      files_inbox: folderId,
      parent: '',
    },
  });

  return { jobId };
};
