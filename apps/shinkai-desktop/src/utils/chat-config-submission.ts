import { type JobConfig } from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { FunctionKeyV2 } from '@shinkai_network/shinkai-node-state/v2/constants';
import { type CreateJobInput } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/types';
import { type UpdateChatConfigInput } from '@shinkai_network/shinkai-node-state/v2/mutations/updateChatConfig/types';
import { getAgent } from '@shinkai_network/shinkai-node-state/v2/queries/getAgent/index';
import { type GetAgentOutput } from '@shinkai_network/shinkai-node-state/v2/queries/getAgent/types';
import { type GetAgentsOutput } from '@shinkai_network/shinkai-node-state/v2/queries/getAgents/types';
import { getLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/index';
import { type GetLLMProvidersOutput } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/types';
import { type GetProviderFromJobOutput } from '@shinkai_network/shinkai-node-state/v2/queries/getProviderFromJob/types';
import { type QueryClient } from '@tanstack/react-query';

import {
  getThinkingConfig,
  getReasoningEfforts,
  normalizeReasoningEffort,
} from './thinking-config';

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
    reasoning_effort:
      thinking || getReasoningEfforts(thinkingConfig, false).length > 0
        ? normalizeReasoningEffort(
            thinkingConfig,
            config.reasoning_effort,
            !!thinking,
          )
        : undefined,
  };
};

const getCachedAgent = (
  queryClient: QueryClient,
  auth: { nodeAddress: string; token: string },
  agentId: string,
) =>
  queryClient.getQueryData<GetAgentOutput>([
    FunctionKeyV2.GET_AGENT,
    { ...auth, agentId },
  ]) ??
  queryClient
    .getQueryData<GetAgentsOutput>([FunctionKeyV2.GET_AGENTS, auth])
    ?.find((agent) => agent.agent_id === agentId);

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
  const directProvider = providers?.find(
    (provider) => provider.id === selectedProviderId,
  );
  if (directProvider) return directProvider.model;
  const agent = getCachedAgent(queryClient, auth, selectedProviderId);
  return providers?.find((provider) => provider.id === agent?.llm_provider_id)
    ?.model;
};

export const normalizeCreateJobInput = (
  queryClient: QueryClient,
  input: CreateJobInput,
): CreateJobInput => {
  const auth = { nodeAddress: input.nodeAddress, token: input.token };
  const model = getCachedModel(queryClient, input, input.llmProvider);
  const thinkingConfig = getThinkingConfig(model);
  if (!input.chatConfig) {
    // Optional and unknown models keep server defaults, including agent config.
    if (!thinkingConfig.forceEnabled) return input;
    const providers = queryClient.getQueryData<GetLLMProvidersOutput>([
      FunctionKeyV2.GET_LLM_PROVIDERS,
      auth,
    ]);
    const agent = providers?.some(
      (provider) => provider.id === input.llmProvider,
    )
      ? undefined
      : getCachedAgent(queryClient, auth, input.llmProvider);
    return {
      ...input,
      chatConfig: {
        ...agent?.config,
        thinking: true,
        reasoning_effort: normalizeReasoningEffort(
          thinkingConfig,
          agent?.config?.reasoning_effort,
        ),
      },
    };
  }
  return {
    ...input,
    chatConfig: normalizeChatThinking(input.chatConfig, model),
  };
};

export const prepareCreateJobInput = async (
  queryClient: QueryClient,
  input: CreateJobInput,
): Promise<CreateJobInput> => {
  const auth = { nodeAddress: input.nodeAddress, token: input.token };
  if (!getCachedModel(queryClient, auth, input.llmProvider)) {
    try {
      await queryClient.ensureQueryData({
        queryKey: [FunctionKeyV2.GET_LLM_PROVIDERS, auth],
        queryFn: () => getLLMProviders(auth),
        retry: false,
      });
    } catch {
      // Metadata is best effort; the real create request reports its own errors.
    }
    if (!getCachedModel(queryClient, auth, input.llmProvider)) {
      try {
        await queryClient.ensureQueryData({
          queryKey: [
            FunctionKeyV2.GET_AGENT,
            { ...auth, agentId: input.llmProvider },
          ],
          queryFn: () => getAgent({ ...auth, agentId: input.llmProvider }),
          retry: false,
        });
      } catch {
        // Unknown or unavailable targets retain their submitted/server config.
      }
    }
  }
  return normalizeCreateJobInput(queryClient, input);
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
