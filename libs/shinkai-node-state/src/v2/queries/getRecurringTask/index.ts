import { getRecurringTask as getRecurringTaskApi } from '@shinkai_network/shinkai-message-ts/api/recurring-tasks/index';

import type { GetRecurringTaskInput } from './types';

export const getRecurringTask = async ({
  nodeAddress,
  token,
  recurringTaskId,
}: GetRecurringTaskInput) => {
  const result = await getRecurringTaskApi(nodeAddress, token, {
    cron_task_id: recurringTaskId,
  });
  return result;
};
