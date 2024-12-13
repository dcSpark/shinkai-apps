import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetRecurringTaskResponse } from '@shinkai_network/shinkai-message-ts/api/recurring-tasks/types';

export type GetRecurringTaskInput = Token & {
  nodeAddress: string;
  recurringTaskId: number;
};

export type GetRecurringTaskOutput = GetRecurringTaskResponse;
