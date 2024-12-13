import { createRecurringTask as createRecurringTaskApi } from '@shinkai_network/shinkai-message-ts/api/recurring-tasks/index';

import { CreateRecurringTaskInput } from './types';

export const createRecurringTask = async ({
  nodeAddress,
  token,
  cronExpression,
  recurringTaskAction,
}: CreateRecurringTaskInput) => {
  const response = await createRecurringTaskApi(nodeAddress, token, {
    cron: cronExpression,
    action: recurringTaskAction,
  });
  return response;
};
