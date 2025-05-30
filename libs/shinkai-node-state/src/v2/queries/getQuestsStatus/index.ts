import { getQuestsStatus as getQuestsStatusApi } from '@shinkai_network/shinkai-message-ts/api/quests/index';

import { type GetQuestsStatusInput } from './types';

export const getQuestsStatus = async ({
  nodeAddress,
  token,
}: GetQuestsStatusInput) => {
  const response = await getQuestsStatusApi(nodeAddress, token);
  return response;
};
