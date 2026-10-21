import { createAgent } from '@shinkai_network/shinkai-node-state/v2/mutations/createAgent/index';
import { type CreateAgentInput } from '@shinkai_network/shinkai-node-state/v2/mutations/createAgent/types';
import { useCreateAgent as useCreateAgentBase } from '@shinkai_network/shinkai-node-state/v2/mutations/createAgent/useCreateAgent';
import { updateAgent } from '@shinkai_network/shinkai-node-state/v2/mutations/updateAgent/index';
import { type UpdateAgentInput } from '@shinkai_network/shinkai-node-state/v2/mutations/updateAgent/types';
import { useUpdateAgent as useUpdateAgentBase } from '@shinkai_network/shinkai-node-state/v2/mutations/updateAgent/useUpdateAgent';
import { type QueryClient, useQueryClient } from '@tanstack/react-query';

import {
  getCachedModel,
  normalizeChatThinking,
} from '../utils/chat-config-submission';

const normalizeAgentInput = <T extends CreateAgentInput | UpdateAgentInput>(
  queryClient: QueryClient,
  input: T,
): T => {
  if (!input.agent.config) return input;
  const model = getCachedModel(queryClient, input, input.agent.llm_provider_id);
  return {
    ...input,
    agent: {
      ...input.agent,
      config: normalizeChatThinking(input.agent.config, model),
    },
  };
};

// Preserve unset form values until the request, so model changes keep their defaults.
export const useCreateAgent = (
  options?: Parameters<typeof useCreateAgentBase>[0],
) => {
  const queryClient = useQueryClient();
  return useCreateAgentBase({
    ...options,
    mutationFn: (input) => createAgent(normalizeAgentInput(queryClient, input)),
  });
};

export const useUpdateAgent = (
  options?: Parameters<typeof useUpdateAgentBase>[0],
) => {
  const queryClient = useQueryClient();
  return useUpdateAgentBase({
    ...options,
    mutationFn: (input) => updateAgent(normalizeAgentInput(queryClient, input)),
  });
};
