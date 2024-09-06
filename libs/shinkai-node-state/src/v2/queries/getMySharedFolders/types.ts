import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { QueryObserverOptions } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';

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

export type GetMySharedFoldersInput = Token & {
  nodeAddress: string;
};
export type UseGetMySharedFolders = [
  FunctionKeyV2.GET_MY_SHARED_FOLDERS,
  GetMySharedFoldersInput,
];

export type GetMyShareFoldersOutput = SharedFolder[];

export type Options = QueryObserverOptions<
  GetMyShareFoldersOutput,
  Error,
  GetMyShareFoldersOutput,
  GetMyShareFoldersOutput,
  UseGetMySharedFolders
>;
