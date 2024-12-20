import { getRecurringTasksExecutionTime as getRecurringTaskExecutionTimeApi } from '@shinkai_network/shinkai-message-ts/api/recurring-tasks/index';

import type { GetRecurringTasksNextExecutionTimeInput } from './types';

export const getRecurringTasksExecutionTime = async ({
  nodeAddress,
  token,
}: GetRecurringTasksNextExecutionTimeInput) => {
  const result = await getRecurringTaskExecutionTimeApi(nodeAddress, token);
  return result;
};
