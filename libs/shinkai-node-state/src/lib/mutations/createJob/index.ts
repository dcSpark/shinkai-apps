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

  let response: any;
  if (files?.length) {
    response = await sendTextMessageWithFilesForInbox(
      shinkaiIdentity,
      profile, // sender subidentity
      receiver,
      content,
      `job_inbox::${jobId}::false`,
      files[0],
      {
        my_device_encryption_sk: my_device_encryption_sk,
        my_device_identity_sk: my_device_identity_sk,
        node_encryption_pk: node_encryption_pk,
        profile_encryption_sk,
        profile_identity_sk,
      }
    );
  } else {
    response = await sendMessageToJob(
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
  }
  return { jobId, response };
};
