import { getMySharedFolders } from './index';

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

type TreeNode = {
  name: string;
  path: string;
  last_modified: string;
  children: { [key: string]: TreeNode };
};

type SubscriptionRequirement = {
  minimum_token_delegation: number;
  minimum_time_delegated_hours: number;
  monthly_payment: {
    USD: number;
  };
  is_free: boolean;
  folder_description: string;
};
type SharedFolder = {
  path: string;
  permission: 'Public' | 'Private';
  tree: TreeNode;
  subscription_requirement: SubscriptionRequirement;
};

export type GetMySharedFoldersRequest = {
  path: string;
  streamer_node_name: string;
  streamer_profile_name: string;
};

export type GetMySharedFoldersResponse = SharedFolder[];

export type GetLastNotificationsRequest = {
  count: number;
  timestamp?: string;
};
export type GetLastNotificationsResponse = {
  datetime: string;
  message: string;
}[];
