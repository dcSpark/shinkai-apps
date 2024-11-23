import {
  createJob as createJobApi,
  updateChatConfig,
} from '@shinkai_network/shinkai-message-ts/api/jobs/index';
import { toolImplementation as createToolCodeApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';
import { CodeLanguage } from '@shinkai_network/shinkai-message-ts/api/tools/types';

import { DEFAULT_CHAT_CONFIG } from '../../constants';
import { CreateToolCodeInput } from './types';

export const createToolCode = async ({
  nodeAddress,
  token,
  llmProviderId,
  message,
}: CreateToolCodeInput) => {
  const { job_id: jobId } = await createJobApi(nodeAddress, token, {
    llm_provider: llmProviderId,
    job_creation_info: {
      scope: {
        vector_fs_items: [],
        vector_fs_folders: [],
        local_vrpack: [],
        local_vrkai: [],
        network_folders: [],
      },
      associated_ui: null,
      is_hidden: true,
    },
  });

  await updateChatConfig(nodeAddress, token, {
    job_id: jobId,
    config: {
      custom_system_prompt: '',
      stream: DEFAULT_CHAT_CONFIG.stream,
      custom_prompt: '',
      top_k: DEFAULT_CHAT_CONFIG.top_k,
      top_p: DEFAULT_CHAT_CONFIG.top_p,
      temperature: DEFAULT_CHAT_CONFIG.temperature,
    },
  });

  return await createToolCodeApi(nodeAddress, token, {
    raw: false,
    message: {
      job_id: jobId,
      content: message,
      files_inbox: '',
    },
    language: CodeLanguage.Typescript,
  });
};