import {
  createJob as createJobApi,
  updateChatConfig,
} from '@shinkai_network/shinkai-message-ts/api/jobs/index';
import { createRecurringTask as createRecurringTaskApi } from '@shinkai_network/shinkai-message-ts/api/recurring-tasks/index';

import { CreateRecurringTaskInput } from './types';

export const createRecurringTask = async ({
  nodeAddress,
  token,
  name,
  description,
  llmProvider,
  cronExpression,
  chatConfig,
  message,
  toolRouterKey,
}: CreateRecurringTaskInput) => {
  const { job_id: jobId } = await createJobApi(nodeAddress, token, {
    llm_provider: llmProvider,
    job_creation_info: {
      scope: {
        vector_fs_items: [],
        vector_fs_folders: [],
        local_vrpack: [],
        local_vrkai: [],
        network_folders: [],
      },
      associated_ui: null,
      is_hidden: false,
    },
  });

  const response = await createRecurringTaskApi(nodeAddress, token, {
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
        message: {
          job_id: jobId,
          content: message,
          tool_router_key: toolRouterKey,
          files_inbox: '',
        },
      },
      // we are repeting jobID here
      // SendMessageToJob: {
      //   job_id: jobId,
      //   message: {
      //     job_id: jobId,
      //     files_inbox: '',
      //     content: 'Recurring task message',
      //     tool_router_key: '',
      //   },
      // },
    },
    description,
    name,
  });
  return response;
};
