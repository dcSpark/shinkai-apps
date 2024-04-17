import { getAvailableSharedFolders as getAvailableSharedFoldersAPI } from '@shinkai_network/shinkai-message-ts/api';

import {
  GetAvailableSharedItemsInput,
  GetAvailableSharedItemsOutput,
} from './types';

export type TreeNode = {
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

type ShinkaiIdentity = {
  id: number;
  createdAt: string;
  updatedAt: string;
  identityRaw: string;
  identity: string;
  addressOrProxyNodes: string[];
  sharedItems: {
    path: string;
    permission: 'Public';
    tree: TreeNode;
    subscription_requirement: SubscriptionRequirement;
  }[];
};
export type ShinkaiIdentitiesWithPaginationOutput = {
  values: ShinkaiIdentity[];
  count: number;
  pages: number;
};

function transformData(input: ShinkaiIdentitiesWithPaginationOutput) {
  const values = input.values.map((value) => ({
    id: value.id,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    identityRaw: value.identityRaw,
    identity: value.identity,
    addressOrProxyNodes: value.addressOrProxyNodes,
    path: value.sharedItems[0].path,
    permission: value.sharedItems[0].permission,
    tree: value.sharedItems[0].tree,
    subscription_requirement: value.sharedItems[0].subscription_requirement,
  }));

  return {
    values,
    count: input.count,
    pages: input.pages,
  };
}

export const getAvailableSharedFolders = async ({
  pageSize,
  page,
}: GetAvailableSharedItemsInput): Promise<GetAvailableSharedItemsOutput> => {
  const response: ShinkaiIdentitiesWithPaginationOutput =
    await getAvailableSharedFoldersAPI(pageSize, page);
  const transformedData = transformData(response);
  return transformedData;
};
