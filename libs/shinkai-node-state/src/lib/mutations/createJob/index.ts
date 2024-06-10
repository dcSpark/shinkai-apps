import {
  createJob as createJobApi,
  sendMessageToJob,
  sendTextMessageWithFilesForInbox,
} from '@shinkai_network/shinkai-message-ts/api';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils';
import {
  JobCreationWrapper,
  JobScopeWrapper,
} from '@shinkai_network/shinkai-message-ts/wasm';

import { CreateJobInput } from './types';

export const createJob = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  agentId,
  content,
  files_inbox,
  files,
  is_hidden,
  workflow,
  selectedVRFiles = [],
  selectedVRFolders = [],
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: CreateJobInput) => {
  const receiver = shinkaiIdentity;
  const receiver_subidentity = `${profile}/agent/${agentId}`;

  const job_creation = JobCreationWrapper.empty().get_scope;
  let scope = new JobScopeWrapper(job_creation.buckets, job_creation.documents);
  if (selectedVRFiles.length > 0 || selectedVRFolders.length > 0) {
    scope = JobCreationWrapper.from_jsvalue({
      is_hidden: false,
      scope: {
        local_vrkai: [],
        local_vrpack: [],
        vector_fs_items: selectedVRFiles.map((vfFile) => ({
          path: vfFile.path,
          name: vfFile.vr_header.resource_name,
          source: vfFile.vr_header.resource_source,
        })),
        vector_fs_folders: selectedVRFolders.map((vfFolder) => ({
          path: vfFolder.path,
          name: vfFolder.name,
        })),

        network_folders: [],
      },
    }).get_scope;
  }

  const hasVRFiles = selectedVRFiles.length > 0 || selectedVRFolders.length > 0;

  const jobId = await createJobApi(
    nodeAddress,
    hasVRFiles ? scope : scope.to_jsvalue(),
    is_hidden == null ? false : is_hidden,
    shinkaiIdentity,
    profile,
    receiver,
    receiver_subidentity,
    {
      my_device_encryption_sk: my_device_encryption_sk,
      my_device_identity_sk: my_device_identity_sk,
      node_encryption_pk: node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );

  files?.length
    ? await sendTextMessageWithFilesForInbox(
        nodeAddress,
        shinkaiIdentity,
        profile, // sender subidentity
        receiver,
        content,
        buildInboxIdFromJobId(jobId),
        files,
        {
          my_device_encryption_sk: my_device_encryption_sk,
          my_device_identity_sk: my_device_identity_sk,
          node_encryption_pk: node_encryption_pk,
          profile_encryption_sk,
          profile_identity_sk,
        },
        workflow,
      )
    : await sendMessageToJob(
        nodeAddress,
        jobId,
        content,
        files_inbox,
        '',
        workflow,
        shinkaiIdentity,
        profile,
        receiver,
        receiver_subidentity,
        {
          my_device_encryption_sk: my_device_encryption_sk,
          my_device_identity_sk: my_device_identity_sk,
          node_encryption_pk: node_encryption_pk,
          profile_encryption_sk,
          profile_identity_sk,
        },
      );
  return { jobId };
};
