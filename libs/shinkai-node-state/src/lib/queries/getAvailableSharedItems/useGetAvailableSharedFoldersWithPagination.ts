import {
  InfiniteData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getAvailableSharedFolders } from '.';
import {
  GetAvailableSharedItemsInput,
  GetAvailableSharedItemsOutput,
  Options,
} from './types';

export const SHARED_FOLDERS_PAGINATION_LIMIT = 8;
export const SHARED_FOLDERS_PAGINATION_REFETCH = 10000;

export const useGetAvailableSharedFoldersWithPagination = (
  input: GetAvailableSharedItemsInput,
) => {
  const response = useInfiniteQuery<
    GetAvailableSharedItemsOutput,
    Error,
    InfiniteData<GetAvailableSharedItemsOutput>,
    [string, GetAvailableSharedItemsInput],
    { page: number | null }
  >({
    queryKey: [FunctionKey.GET_AVAILABLE_SHARED_ITEMS, input],
    queryFn: async ({ pageParam }) =>
      await getAvailableSharedFolders({
        ...input,
        page: pageParam?.page ?? 0,
        pageSize: SHARED_FOLDERS_PAGINATION_LIMIT,
      }),

    getNextPageParam: (response, _, params) => {
      const currentPage = params?.page ?? 0;
      if (response.count === 0) return;
      if (currentPage + 1 === response.pages) return;
      return { page: currentPage + 1 };
    },
    refetchInterval: SHARED_FOLDERS_PAGINATION_REFETCH,
    initialPageParam: { page: null },
    getPreviousPageParam: () => {
      return { page: null };
    },
  });
  return response;
};

export const useGetAvailableSharedFolders = (
  input: GetAvailableSharedItemsInput,
  options?: Options,
) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_AVAILABLE_SHARED_ITEMS, input],
    queryFn: async () => await getAvailableSharedFolders(input),
    ...options,
  });
  return response;
};
