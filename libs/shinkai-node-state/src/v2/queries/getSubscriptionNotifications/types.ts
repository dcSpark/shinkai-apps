import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetLastNotificationsResponse } from '@shinkai_network/shinkai-message-ts/api/subscriptions/types';
import { QueryObserverOptions } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';

export type GetSubscriptionNotificationsInput = Token & {
  nodeAddress: string;
};

export type UseGetSubscriptionNotifications = [
  FunctionKeyV2.GET_SUBSCRIPTION_NOTIFICATIONS,
  GetSubscriptionNotificationsInput,
];

export type GetSubscriptionNotificationsOutput = GetLastNotificationsResponse;

export type Options = QueryObserverOptions<
  GetSubscriptionNotificationsOutput,
  Error,
  GetSubscriptionNotificationsOutput,
  GetSubscriptionNotificationsOutput,
  UseGetSubscriptionNotifications
>;
