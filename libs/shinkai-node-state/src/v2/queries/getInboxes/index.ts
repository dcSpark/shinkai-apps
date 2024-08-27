import { getAllInboxes as getAllInboxesApi } from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import type { GetInboxesInput } from './types';

export const getInboxes = async ({ nodeAddress, token }: GetInboxesInput) => {
  const inboxes = await getAllInboxesApi(nodeAddress, token);
  return inboxes;
};
