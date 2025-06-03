import { getRecurringTasks as getRecurringTasksApi } from '@shinkai_network/shinkai-message-ts/api/recurring-tasks/index';

import  { type GetRecurringTasksInput } from './types';

export const getRecurringTasks = async ({
  nodeAddress,
  token,
}: GetRecurringTasksInput) => {
  const result = await getRecurringTasksApi(nodeAddress, token);
  return result;
};
