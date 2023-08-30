import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';
import { QueryObserverOptions } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';

enum SubscriptionStatus {
  SubscriptionRequested = 'SubscriptionRequested',
  SubscriptionConfirmed = 'SubscriptionConfirmed',
  UnsubscribeRequested = 'UnsubscribeRequested',
  UnsubscribeConfirmed = 'UnsubscribeConfirmed',
  UpdateSubscriptionRequested = 'UpdateSubscriptionRequested',
  UpdateSubscriptionConfirmed = 'UpdateSubscriptionConfirmed',
}
type Subscription = {
  subscription_id: {
    unique_id: string;
  };
  shared_folder: string;
  streaming_node: string;
  streaming_profile: string;
  subscription_description: string | null;
  subscriber_destination_path: string | null;
  subscriber_node: string;
  subscriber_profile: string;
  payment: 'Free' | 'Paid';
  state: SubscriptionStatus;
  date_created: string;
  last_modified: string;
  last_sync: string | null;
};

export type GetMySubscriptionsInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
};

export type UseGetAvailableSharedItems = [
  FunctionKey.GET_MY_SUBSCRIPTIONS,
  GetMySubscriptionsInput,
];

export type GetMySubscriptionsOutput = Subscription[];

export type Options = QueryObserverOptions<
  GetMySubscriptionsOutput,
  Error,
  GetMySubscriptionsOutput,
  GetMySubscriptionsOutput,
  UseGetAvailableSharedItems
>;
