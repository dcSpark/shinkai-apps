import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';
import { QueryObserverOptions } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';

type SubscriptionNotification = {
  datetime: string;
  message: string;
};

export type GetSubscriptionNotificationsInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
};

export type UseGetSubscriptionNotifications = [
  FunctionKey.GET_SUBSCRIPTION_NOTIFICATIONS,
  GetSubscriptionNotificationsInput,
];

export type GetSubscriptionNotificationsOutput = SubscriptionNotification[];

export type Options = QueryObserverOptions<
  GetSubscriptionNotificationsOutput,
  Error,
  GetSubscriptionNotificationsOutput,
  GetSubscriptionNotificationsOutput,
  UseGetSubscriptionNotifications
>;
