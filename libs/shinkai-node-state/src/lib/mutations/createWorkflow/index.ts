import { createWorkflow as createWorkflowAPI } from '@shinkai_network/shinkai-message-ts/api';

import { CreateWorkflowInput } from './types';

export const createWorkflow = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  workflowRaw,
  workflowDescription,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: CreateWorkflowInput) => {
  return await createWorkflowAPI(
    nodeAddress,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
    workflowRaw,
    workflowDescription,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );
};
