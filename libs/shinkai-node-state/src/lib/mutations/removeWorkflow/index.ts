import { removeWorkflow as removeWorkflowAPI } from '@shinkai_network/shinkai-message-ts/api';

import { RemoveWorkflowInput } from './types';

export const removeWorkflow = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  workflowKey,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: RemoveWorkflowInput) => {
  return await removeWorkflowAPI(
    nodeAddress,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
    workflowKey,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );
};
