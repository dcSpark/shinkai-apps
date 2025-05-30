import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type GetRecurringTaskResponse } from '@shinkai_network/shinkai-message-ts/api/recurring-tasks/types';

export type GetRecurringTasksNextExecutionTimeInput = Token & {
  nodeAddress: string;
};

export type GetRecurringTasksNextExecutionTimeOutput = GetRecurringTaskResponse;
