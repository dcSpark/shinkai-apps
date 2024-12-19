import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { JobConfig } from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { CreateRecurringTaskResponse } from '@shinkai_network/shinkai-message-ts/api/recurring-tasks/types';

export type UpdateRecurringTaskOutput = CreateRecurringTaskResponse;

export type UpdateRecurringTaskInput = Token & {
  nodeAddress: string;
  name: string;
  active: boolean;
  description?: string;
  taskId: string;
  jobId: string;
  cronExpression: string;
  message: string;
  toolRouterKey?: string;
  llmProvider: string;
  chatConfig: JobConfig;
};
