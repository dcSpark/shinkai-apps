import { setRecurringTask as setRecurringTaskApi } from '@shinkai_network/shinkai-message-ts/api/recurring-tasks/index';

import { UpdateRecurringTaskInput } from './types';

export const updateRecurringTask = async ({
  nodeAddress,
  token,
  name,
  description,
  llmProvider,
  cronExpression,
  chatConfig,
  message,
  toolRouterKey,
  taskId,
  jobId,
}: UpdateRecurringTaskInput) => {
  const response = await setRecurringTaskApi(nodeAddress, token, {
    cron_task_id: taskId,
    name: name,
    description: description,
    cron: cronExpression,
    action: {
      CreateJobWithConfigAndMessage: {
        config: chatConfig,
        job_creation_info: {
          associated_ui: null,
          is_hidden: false,
          scope: {
            vector_fs_folders: [],
            vector_fs_items: [],
            local_vrpack: [],
            local_vrkai: [],
            network_folders: [],
          },
        },
        llm_provider: llmProvider,
        message: {
          job_id: jobId,
          content: message,
          tool_router_key: toolRouterKey,

          files_inbox: '',
        },
      },
    },
  });
  return response;
};
