import { type JobConfig, type JobMessage } from '../jobs/types';

export type RecurringTaskAction =
  | {
      SendMessageToJob: {
        job_id: string;
        message: JobMessage;
      };
    }
  | {
      CreateJobWithConfigAndMessage: {
        config: JobConfig;
        message: JobMessage;
        llm_provider: string;
        job_creation_info: {
          scope: {
            vector_fs_folders: string[];
            vector_fs_items: string[];
          };
          is_hidden?: boolean;
          associated_ui?: null;
        };
      };
    };

export type CreateRecurringTaskRequest = Omit<
  RecurringTask,
  'created_at' | 'last_modified' | 'paused' | 'task_id'
>;

export type CreateRecurringTaskResponse = RecurringTask;

export type RecurringTask = {
  task_id: number;
  cron: string;
  created_at: string;
  last_modified: string;
  action: RecurringTaskAction;
  description?: string;
  name: string;
  paused: boolean;
};

export type GetRecurringTasksResponse = RecurringTask[];

export type GetRecurringTaskRequest = {
  cron_task_id: string;
};
export type GetRecurringTaskResponse = RecurringTask;
export type GetRecurringTasksNextExecutionTimeResponse = [
  RecurringTask,
  string,
][];
export type SetRecurringTaskRequest = {
  cron_task_id: string;
} & Omit<RecurringTask, 'task_id' | 'created_at' | 'last_modified'>;

export type SetRecurringTaskResponse = RecurringTask;
export type RemoveRecurringTaskRequest = {
  cron_task_id: string;
};
export type RemoveRecurringTaskResponse = {
  status: string;
};
export type GetRecurringTaskLogsRequest = {
  cron_task_id: string;
};
export type GetRecurringTaskLogsResponse = {
  task_id: string;
  execution_time: string;
  success: boolean;
  error_message: string;
  job_id: string;
}[];
