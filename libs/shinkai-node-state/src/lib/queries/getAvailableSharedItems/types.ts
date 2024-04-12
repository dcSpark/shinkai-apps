import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';
import { QueryObserverOptions } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';

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
};
type SharedItem = {
  path: string;
  permission: 'Public' | 'Private'; // Assuming permissions are either 'Public' or 'Private'
  tree: TreeNode;
  subscription_requirement: SubscriptionRequirement;
};

export type GetAvailableSharedItemsInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
};
export type UseGetAvailableSharedItems = [
  FunctionKey.GET_AVAILABLE_SHARED_ITEMS,
  GetAvailableSharedItemsInput,
];

export type GetAvailableSharedItemsOutput = SharedItem[];

export type Options = QueryObserverOptions<
  GetAvailableSharedItemsOutput,
  Error,
  GetAvailableSharedItemsOutput,
  GetAvailableSharedItemsOutput,
  UseGetAvailableSharedItems
>;
