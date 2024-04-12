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

type SharedFolder = {
  path: string;
  permission: 'Public';
  tree: TreeNode;
  subscription_requirement: SubscriptionRequirement;
};
export type GetAvailableSharedItemsOutput = {
  node_name: string;
  last_ext_node_response: string;
  last_request_to_ext_node: string;
  last_updated: string;
  state: 'ResponseAvailable';
  response_last_updated: string;
  response: {
    [key: string]: SharedFolder;
  };
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

export type Options = QueryObserverOptions<
  GetAvailableSharedItemsOutput,
  Error,
  GetAvailableSharedItemsOutput,
  GetAvailableSharedItemsOutput,
  UseGetAvailableSharedItems
>;
