import { checkHealth as checkHealthApi } from '@shinkai_network/shinkai-message-ts/api/general/index';

import { GetHealthInput, GetHealthOutput } from './types';

export const getHealth = async ({
  nodeAddress,
}: GetHealthInput): Promise<GetHealthOutput> => {
  const response = await checkHealthApi(nodeAddress);
  return response;
};
