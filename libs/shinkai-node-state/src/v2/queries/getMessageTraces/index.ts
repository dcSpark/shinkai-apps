import { getMessageTraces as getMessageTracesApi } from '@shinkai_network/shinkai-message-ts/api/jobs/index';
import { type GetMessageTracesInput } from './types';

export const getMessageTraces = async ({
  nodeAddress,
  token,
  messageId,
}: GetMessageTracesInput) => {
  const result = await getMessageTracesApi(nodeAddress, token, {
    message_id: messageId,
  });
  return result;
};
