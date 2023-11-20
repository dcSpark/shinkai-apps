import {
  createJob as createJobApi,
  sendMessageToJob,
  sendTextMessageWithFilesForInbox,
} from "@shinkai_network/shinkai-message-ts/api";
import {
  JobCreationWrapper,
  JobScopeWrapper,
} from "@shinkai_network/shinkai-message-ts/wasm";

import { CreateJobInput } from "./types";

export const buildInboxIdFromJobId = (jobId: string): string => {
  // TODO: job_inbox, false is hardcoded
  return `job_inbox::${jobId}::false`;
};

export const createJob = async ({
  shinkaiIdentity,
  profile,
  agentId,
  content,
  files_inbox,
  file,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: CreateJobInput) => {
  const receiver = shinkaiIdentity;
  const receiver_subidentity = `${profile}/agent/${agentId}`;

  const job_creation = JobCreationWrapper.empty().get_scope;
  const scope = new JobScopeWrapper(job_creation.buckets, job_creation.documents);

  const jobId = await createJobApi(
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
    }
  );

  const response = file
    ? await sendTextMessageWithFilesForInbox(
        shinkaiIdentity,
        profile, // sender subidentity
        receiver,
        content,
        buildInboxIdFromJobId(jobId),
        file,
        {
          my_device_encryption_sk: my_device_encryption_sk,
          my_device_identity_sk: my_device_identity_sk,
          node_encryption_pk: node_encryption_pk,
          profile_encryption_sk,
          profile_identity_sk,
        }
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
        }
      );
  return { jobId, response };
};
