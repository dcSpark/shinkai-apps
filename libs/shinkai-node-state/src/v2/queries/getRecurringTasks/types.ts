import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetRecurringTasksResponse } from '@shinkai_network/shinkai-message-ts/api/recurring-tasks/types';

export type GetRecurringTasksInput = Token & {
  nodeAddress: string;
};

export type GetRecurringTasksOutput = GetRecurringTasksResponse;
