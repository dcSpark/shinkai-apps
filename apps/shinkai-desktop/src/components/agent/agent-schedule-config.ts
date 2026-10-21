import { type JobConfig } from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { DEFAULT_CHAT_CONFIG } from '@shinkai_network/shinkai-node-state/v2/constants';

import { normalizeChatThinking } from '../../utils/chat-config-submission';

export const getAgentScheduleConfig = (
  config: JobConfig | null | undefined,
  model: string | undefined,
  useTools: boolean,
): JobConfig =>
  normalizeChatThinking(
    {
      custom_prompt: config?.custom_prompt ?? '',
      temperature: config?.temperature,
      top_p: config?.top_p,
      top_k: config?.top_k,
      use_tools: useTools,
      thinking: config?.thinking ?? DEFAULT_CHAT_CONFIG.thinking,
      reasoning_effort: config?.reasoning_effort,
      web_search_enabled:
        config?.web_search_enabled ?? DEFAULT_CHAT_CONFIG.web_search_enabled,
      stream: true,
    },
    model,
  );
