import { retryMessage as retryMessageApi } from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { type RetryMessageInput } from './types';

export const retryMessage = async ({
  nodeAddress,
  token,
  inboxId,
  messageId,
}: RetryMessageInput) => {
  return await retryMessageApi(nodeAddress, token, {
    message_id: messageId,
    inbox_name: inboxId,
  });
};
