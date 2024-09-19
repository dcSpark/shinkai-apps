import { getLastNotifications as getLastNotificationsApi } from '@shinkai_network/shinkai-message-ts/api/subscriptions/index';

import { GetSubscriptionNotificationsInput } from './types';

export const getSubscriptionNotifications = async ({
  nodeAddress,
  token,
}: GetSubscriptionNotificationsInput) => {
  const response = await getLastNotificationsApi(nodeAddress, token, {
    count: 15,
  });
  return response;
};
