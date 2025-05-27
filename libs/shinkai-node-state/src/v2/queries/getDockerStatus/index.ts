import { getDockerStatus as getDockerStatusApi } from '@shinkai_network/shinkai-message-ts/api/general/index';

import { GetDockerStatusInput } from './types';

export const getDockerStatus = async ({
  nodeAddress,
}: GetDockerStatusInput) => {
  const response = await getDockerStatusApi(nodeAddress);
  return response;
};
