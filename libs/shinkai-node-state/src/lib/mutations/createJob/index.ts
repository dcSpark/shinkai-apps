import {
  createJob as createJobApi,
  sendMessageToJob,
  sendTextMessageWithFilesForInbox,
} from '@shinkai_network/shinkai-message-ts/api';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils';
import { JobScope } from '@shinkai_network/shinkai-typescript';

import { CreateJobInput } from './types';

export const createJob = async ({
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

  const scope: JobScope = {
    local: [],
    database: [],
  };

  const jobId = await createJobApi(
    scope,
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
        jobId,
        content,
        files_inbox,
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
