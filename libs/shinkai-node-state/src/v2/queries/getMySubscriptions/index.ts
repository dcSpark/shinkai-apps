import { getMySubscriptions as getMySubscriptionsAPI } from '@shinkai_network/shinkai-message-ts/api/subscriptions/index';

import { GetMySubscriptionsInput, GetMySubscriptionsOutput } from './types';

export const getMySubscriptions = async ({
  nodeAddress,
  token,
}: GetMySubscriptionsInput) => {
  const response = await getMySubscriptionsAPI(nodeAddress, token);
  return response;
};
