import { updateTool as updateToolAPI } from '@shinkai_network/shinkai-message-ts/api';

import { UpdateToolInput } from './types';

export const updateTool = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  // workflowRaw,
  // workflowDescription,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: UpdateToolInput) => {
  return await updateToolAPI(
    nodeAddress,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
    // workflowRaw,
    // workflowDescription,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );
};
