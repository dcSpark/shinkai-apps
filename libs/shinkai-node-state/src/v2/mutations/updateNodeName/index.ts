import { updateNodeName as updateNodeNameApi } from '@shinkai_network/shinkai-message-ts/api/general/index';

import { type UpdateNodeNameInput, type UpdateNodeNameOutput } from './types';

export const updateNodeName = async ({
  nodeAddress,
  newNodeName,
  token,
}: UpdateNodeNameInput): Promise<UpdateNodeNameOutput> => {
  const response = await updateNodeNameApi(nodeAddress, token, newNodeName);
  return response;
};
