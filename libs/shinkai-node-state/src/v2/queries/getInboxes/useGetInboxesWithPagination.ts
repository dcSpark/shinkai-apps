import { type GetAllInboxesWithPaginationRequest } from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { type InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type APIError } from '../../types';
import {
  type GetInboxesInput,
  type GetInboxesOutput,
  // type Options,
  type UseGetInboxes,
} from './types';
import { getInboxesWithPagination } from '.';

const DEFAULT_LIMIT = 20;

export const useGetInboxesWithPagination = (
  input: GetInboxesInput,
  // options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useInfiniteQuery<
    GetInboxesOutput,
    APIError,
    InfiniteData<GetInboxesOutput>,
    UseGetInboxes,
    GetAllInboxesWithPaginationRequest
  >({
    queryKey: [FunctionKeyV2.GET_INBOXES_WITH_PAGINATION, input],
    queryFn: ({ pageParam }) =>
      getInboxesWithPagination({
        ...input,
        offset: pageParam?.offset ?? undefined, // offset is last inbox id
        limit: pageParam?.limit ?? DEFAULT_LIMIT,
        show_hidden: false,
      }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage?.inboxes?.length < DEFAULT_LIMIT) return;
      const lastInbox = pages.at(-1)?.inboxes?.at(-1);
      if (!lastInbox) return null;
      return { offset: lastInbox.inbox_id };
    },
    initialPageParam: { offset: undefined },
  });
  return response;
};
