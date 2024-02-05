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
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: CreateJobInput) => {
  const receiver = shinkaiIdentity;
  const receiver_subidentity = `${profile}/agent/${agentId}`;

  const job_creation = JobCreationWrapper.empty().get_scope;
  const scope = new JobScopeWrapper(
    job_creation.buckets,
    job_creation.documents,
  );

  const jobId = await createJobApi(
    nodeAddress,
    scope.to_jsvalue(),
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

  const response = files?.length
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
      )
    : await sendMessageToJob(
        nodeAddress,
        jobId,
        content,
        files_inbox,
        '',
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
  return { jobId, response };
};
