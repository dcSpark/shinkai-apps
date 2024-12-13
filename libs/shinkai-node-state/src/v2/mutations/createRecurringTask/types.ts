import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  CreateRecurringTaskResponse,
  RecurringTaskAction,
} from '@shinkai_network/shinkai-message-ts/api/recurring-tasks/types';

export type CreateRecurringTaskOutput = CreateRecurringTaskResponse;

export type CreateRecurringTaskInput = Token & {
  nodeAddress: string;
  cronExpression: string;
  recurringTaskAction: RecurringTaskAction;
};
