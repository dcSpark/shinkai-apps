import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetRecurringTaskLogsResponse } from '@shinkai_network/shinkai-message-ts/api/recurring-tasks/types';

export type GetRecurringTaskLogsInput = Token & {
  nodeAddress: string;
  recurringTaskId: string;
};

export type GetRecurringTaskLogsOutput = GetRecurringTaskLogsResponse;
