import { restoreToolConversation as restoreToolConversationApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { type RestoreToolConversationInput } from './types';

export const restoreToolConversation = async ({
  nodeAddress,
  token,
  jobId,
  messageId,
}: RestoreToolConversationInput) => {
  return await restoreToolConversationApi(nodeAddress, token, {
    job_id: jobId,
    message_hash: messageId,
  });
};
