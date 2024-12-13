import {
  JobConfig,
  JobMessage,
  VRFolderScope,
  VRItemScope,
} from '../jobs/types';
import { getRecurringTaskLogs } from './index';

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
  cron: string;
  action: RecurringTaskAction;
};

export type CreateRecurringTaskResponse = {};

export type RecurringTask = {
  task_id: number;
  cron: string;
  created_at: string;
  last_modified: string;
  action: RecurringTaskAction;
};

export type GetRecurringTasksResponse = RecurringTask[];

export type GetRecurringTaskRequest = {
  cron_task_id: number;
};
export type GetRecurringTaskResponse = RecurringTask;
export type RemoveRecurringTaskRequest = {
  cron_task_id: number;
};
export type RemoveRecurringTaskResponse = {
  status: string;
};
export type GetRecurringTaskLogsRequest = {
  cron_task_id: number;
};
