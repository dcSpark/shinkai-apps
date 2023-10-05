import {
  createJob as createJobApi,
  sendMessageToJob,
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
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: CreateJobInput) => {
  const sender = shinkaiIdentity + "/" + profile;
  const receiver = shinkaiIdentity;
  const receiver_subidentity = `${profile}/agent/${agentId}`;

  const job_creation = JobCreationWrapper.empty().get_scope;
  const scope = new JobScopeWrapper(job_creation.buckets, job_creation.documents);

  const jobId = await createJobApi(
    scope.to_jsvalue(),
    sender,
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

  const response = await sendMessageToJob(
    jobId,
    content,
    files_inbox,
    sender,
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
