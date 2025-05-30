import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type JobConfig } from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import {
  type CreateRecurringTaskResponse
} from '@shinkai_network/shinkai-message-ts/api/recurring-tasks/types';

export type CreateRecurringTaskOutput = CreateRecurringTaskResponse;

export type CreateRecurringTaskInput = Token & {
  nodeAddress: string;
  name: string;
  description?: string;
  cronExpression: string;
  message: string;
  toolKey?: string;
  llmProvider: string;
  // recurringTaskAction: RecurringTaskAction;
  chatConfig: JobConfig;
};
