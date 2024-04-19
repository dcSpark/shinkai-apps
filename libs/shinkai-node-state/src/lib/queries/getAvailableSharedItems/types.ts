import { QueryObserverOptions } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';

export type FolderTreeNode = {
  name: string;
  path: string;
  last_modified: string;
  children: { [key: string]: FolderTreeNode };
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

type SharedFolderItem = {
  id: number;
  createdAt: string;
  updatedAt: string;
  raw: {
    path: string;
    tree: FolderTreeNode;
    permission: 'Public';
    subscription_requirement: SubscriptionRequirement;
  };
  path: string;
  isFree: boolean;
  folderDescription: string;
  lastModified: string;
  identity: {
    id: number;
    createdAt: string;
    updatedAt: string;
    identityRaw: string;
    identity: string;
  };
};
export type GetAvailableSharedItemsOutput = {
  values: SharedFolderItem[];
  count: number;
  pages: number;
};
export type PriceFilters = 'free' | 'paid' | 'all';
export type GetAvailableSharedItemsInput = {
  pageSize?: number;
  page?: number;
  priceFilter?: PriceFilters;
  search?: string;
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
