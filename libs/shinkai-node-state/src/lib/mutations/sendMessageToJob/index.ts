import { sendMessageToJob as sendMessageToJobApi } from '@shinkai_network/shinkai-message-ts/api';

import { SendMessageToJobInput } from './types';

export const sendMessageToJob = async ({
  nodeAddress,
  jobId,
  message,
  files_inbox,
  parent,
  workflow,
  workflowName,
  shinkaiIdentity,
  profile,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: SendMessageToJobInput) => {
  return await sendMessageToJobApi(
    nodeAddress,
    jobId,
    message,
    files_inbox,
    parent,
    workflow,
    workflowName,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    '',
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );
};
