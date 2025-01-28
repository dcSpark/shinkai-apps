import {
  getAllInboxes as getAllInboxesApi,
  getAllInboxesWithPagination as getAllInboxesWithPaginationApi,
} from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import type { GetInboxesInput } from './types';

export const getInboxes = async ({ nodeAddress, token }: GetInboxesInput) => {
  const inboxes = await getAllInboxesApi(nodeAddress, token);
  return inboxes;
};

export const getInboxesWithPagination = async ({
  nodeAddress,
  token,
  limit,
  offset,
  show_hidden,
}: GetInboxesInput) => {
  const inboxes = await getAllInboxesWithPaginationApi(nodeAddress, token, {
    limit,
    offset,
    show_hidden,
  });
  return inboxes;
};
