import { createWorkflow as createWorkflowApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { CreateWorkflowInput } from './types';

export const createWorkflow = async ({
  nodeAddress,
  token,
  raw,
  description,
}: CreateWorkflowInput) => {
  const response = await createWorkflowApi(nodeAddress, token, {
    description,
    workflow_raw: raw,
  });
  return response;
};
