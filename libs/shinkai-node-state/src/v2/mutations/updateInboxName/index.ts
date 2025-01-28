import { updateInboxName as updateInboxNameApi } from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { UpdateInboxNameInput } from './types';

export const updateInboxName = async ({
  nodeAddress,
  token,
  inboxName,
  inboxId,
}: UpdateInboxNameInput) => {
  const response = await updateInboxNameApi(nodeAddress, token, {
    custom_name: inboxName,
    inbox_name: inboxId,
  });

  return response;
};
