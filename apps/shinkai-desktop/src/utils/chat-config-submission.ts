import { type JobConfig } from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { FunctionKeyV2 } from '@shinkai_network/shinkai-node-state/v2/constants';
import { type CreateJobInput } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/types';
import { type UpdateChatConfigInput } from '@shinkai_network/shinkai-node-state/v2/mutations/updateChatConfig/types';
import { type GetAgentOutput } from '@shinkai_network/shinkai-node-state/v2/queries/getAgent/types';
import { type GetAgentsOutput } from '@shinkai_network/shinkai-node-state/v2/queries/getAgents/types';
import { type GetLLMProvidersOutput } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/types';
import { type GetProviderFromJobOutput } from '@shinkai_network/shinkai-node-state/v2/queries/getProviderFromJob/types';
import { type QueryClient } from '@tanstack/react-query';

import { getThinkingConfig, normalizeReasoningEffort } from './thinking-config';

export const normalizeChatThinking = (
  config: JobConfig,
  model: string | undefined,
): JobConfig => {
  const thinkingConfig = getThinkingConfig(model);
  // Preserve custom models and submissions whose metadata is not loaded.
  if (!thinkingConfig.supportsThinking) return config;
  const thinking = thinkingConfig.forceEnabled || config.thinking;
  return {
    ...config,
    thinking,
    reasoning_effort: thinking
      ? normalizeReasoningEffort(thinkingConfig, config.reasoning_effort)
      : undefined,
  };
};

export const getCachedModel = (
  queryClient: QueryClient,
  input: { nodeAddress: string; token: string },
  selectedProviderId: string,
): string | undefined => {
  const auth = { nodeAddress: input.nodeAddress, token: input.token };
  const providers = queryClient.getQueryData<GetLLMProvidersOutput>([
    FunctionKeyV2.GET_LLM_PROVIDERS,
    auth,
  ]);
  const agents = queryClient.getQueryData<GetAgentsOutput>([
    FunctionKeyV2.GET_AGENTS,
    auth,
  ]);
  const agent = queryClient.getQueryData<GetAgentOutput>([
    FunctionKeyV2.GET_AGENT,
    { ...auth, agentId: selectedProviderId },
  ]);
  const providerId =
    agent?.llm_provider_id ??
    agents?.find((agent) => agent.agent_id === selectedProviderId)
      ?.llm_provider_id ??
    selectedProviderId;
  return providers?.find((provider) => provider.id === providerId)?.model;
};

export const normalizeCreateJobInput = (
  queryClient: QueryClient,
  input: CreateJobInput,
): CreateJobInput => {
  if (!input.chatConfig) return input;
  const model = getCachedModel(queryClient, input, input.llmProvider);
  return {
    ...input,
    chatConfig: normalizeChatThinking(input.chatConfig, model),
  };
};

export type ChatConfigSubmissionInput = UpdateChatConfigInput & {
  // Model switches must use the new selection before the job query refreshes.
  selectedProviderId?: string;
};

export const normalizeUpdateChatConfigInput = (
  queryClient: QueryClient,
  input: ChatConfigSubmissionInput,
): UpdateChatConfigInput => {
  const provider = queryClient.getQueryData<GetProviderFromJobOutput>([
    FunctionKeyV2.GET_PROVIDER_FROM_JOB,
    { nodeAddress: input.nodeAddress, token: input.token, jobId: input.jobId },
  ]);
  const { selectedProviderId, ...request } = input;
  const model = selectedProviderId
    ? getCachedModel(queryClient, input, selectedProviderId)
    : provider?.agent.model;
  return {
    ...request,
    jobConfig: normalizeChatThinking(input.jobConfig, model),
  };
};
