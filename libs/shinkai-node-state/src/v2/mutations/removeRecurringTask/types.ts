import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type RemoveRecurringTaskResponse } from '@shinkai_network/shinkai-message-ts/api/recurring-tasks/types';

export type RemoveRecurringTaskOutput = RemoveRecurringTaskResponse;

export type RemoveRecurringTaskInput = Token & {
  nodeAddress: string;
  recurringTaskId: string;
};
