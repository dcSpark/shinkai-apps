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

export type GetMySubscriptionsResponse = Subscription[];

export type GetLastNotificationsRequest = {
  count: number;
  timestamp?: string;
};
export type GetLastNotificationsResponse = {
  datetime: string;
  message: string;
}[];
