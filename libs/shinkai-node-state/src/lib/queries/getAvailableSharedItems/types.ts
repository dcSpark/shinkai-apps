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
  folder_description: string;
};

export type SharedFolder = {
  id: number;
  createdAt: string;
  updatedAt: string;
  identityRaw: string;
  identity: string;
  addressOrProxyNodes: string[];
  //
  path: string;
  permission: 'Public';
  tree: TreeNode;
  subscription_requirement: SubscriptionRequirement;
};
export type GetAvailableSharedItemsOutput = {
  values: SharedFolder[];
  count: number;
  pages: number;
};

export type GetAvailableSharedItemsInput = {
  pageSize: number;
  page: number;
};
export type UseGetAvailableSharedItems = [
  FunctionKey.GET_AVAILABLE_SHARED_ITEMS,
  GetAvailableSharedItemsInput,
];

export type Options = QueryObserverOptions<
  GetAvailableSharedItemsOutput,
  Error,
  GetAvailableSharedItemsOutput,
  GetAvailableSharedItemsOutput,
  UseGetAvailableSharedItems
>;
