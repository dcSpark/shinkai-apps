import { health } from '@shinkai_network/shinkai-message-ts/api';

import { GetHealthInput, GetHealthOutput } from './types';

export const getHealth = async ({
  node_address,
}: GetHealthInput): Promise<GetHealthOutput> => {
  const response = await health({
    node_address,
  });
  return response;
};
