import {
  JobConfig,
  JobMessage,
  VRFolderScope,
  VRItemScope,
} from '../jobs/types';

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
        job_creation_info: {
          scope: {
            network_folders: [];
            vector_fs_folders: VRFolderScope[];
            vector_fs_items: VRItemScope[];
            local_vrpack: [];
            local_vrkai: [];
          };
          is_hidden?: boolean;
          associated_ui?: null;
        };
      };
    };

export type CreateRecurringTaskRequest = {
  name: string;
  description?: string;
  cron: string;
  action: RecurringTaskAction;
};

export type CreateRecurringTaskResponse = RecurringTask;

export type RecurringTask = {
  task_id: number;
  cron: string;
  created_at: string;
  last_modified: string;
  action: RecurringTaskAction;
  description?: string;
  name: string;
};

export type GetRecurringTasksResponse = RecurringTask[];

export type GetRecurringTaskRequest = {
  cron_task_id: string;
};
export type GetRecurringTaskResponse = RecurringTask;
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
}[];
