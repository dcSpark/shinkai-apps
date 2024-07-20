import { updateWorkflow as updateWorkflowAPI } from '@shinkai_network/shinkai-message-ts/api';

import { UpdateWorkflowInput } from './types';

export const updateWorkflow = async ({
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
}: UpdateWorkflowInput) => {
  return await updateWorkflowAPI(
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
