import {
  createJob,
  sendMessageToJob,
  updateChatConfig,
} from '@shinkai_network/shinkai-message-ts/api/jobs/index';
import { type JobConfig } from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { FunctionKeyV2 } from '@shinkai_network/shinkai-node-state/v2/constants';
import { getAgent } from '@shinkai_network/shinkai-node-state/v2/queries/getAgent/index';
import { getLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { type PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCreateJob } from './use-chat-config-mutations';

const state = vi.hoisted(() => ({ events: [] as string[] }));
vi.mock('@shinkai_network/shinkai-message-ts/api/jobs/index', () => ({
  createJob: vi.fn(async () => {
    state.events.push('create');
    return { job_id: 'job' };
  }),
  updateChatConfig: vi.fn(async () => {
    state.events.push('config');
    return {};
  }),
  sendMessageToJob: vi.fn(async () => {
    state.events.push('message');
    return {};
  }),
  uploadFilesToJob: vi.fn(),
}));
vi.mock(
  '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/index',
  () => ({ getLLMProviders: vi.fn(async () => providers) }),
);
vi.mock(
  '@shinkai_network/shinkai-node-state/v2/queries/getAgent/index',
  () => ({ getAgent: vi.fn(async () => savedAgent) }),
);
const auth = { nodeAddress: 'http://node', token: 'test' };
const providers = [
  { id: 'kimi', model: 'togetherai:moonshotai/Kimi-K3' },
  { id: 'claude', model: 'claude:claude-fable-5-1' },
  { id: 'gemini', model: 'gemini:gemini-3.5-flash-lite' },
  { id: 'luna', model: 'openai:gpt-6-luna' },
  { id: 'custom', model: 'openai:custom' },
];
const savedConfig = {
  custom_prompt: 'Keep agent prompt',
  custom_system_prompt: 'Keep system',
  thinking: false,
  reasoning_effort: 'xhigh' as const,
  temperature: 0.2,
  other_model_params: { custom: 'keep' },
};
const savedAgent = {
  agent_id: 'saved-agent',
  llm_provider_id: 'claude',
  config: savedConfig,
};
const setup = () => {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
};
beforeEach(() => {
  vi.clearAllMocks();
  state.events.length = 0;
});
const submit = async (
  wrapper: ReturnType<typeof setup>['wrapper'],
  target: string,
  chatConfig?: JobConfig,
) => {
  const { result } = renderHook(() => useCreateJob(), { wrapper });
  await act(async () => {
    await result.current.mutateAsync({
      ...auth,
      llmProvider: target,
      content: 'Try prompt',
      isHidden: true,
      chatConfig,
    });
  });
};

describe('new chat request preparation', () => {
  it('resolves a cold direct provider and applies its model default before sending', async () => {
    const { wrapper } = setup();
    await submit(wrapper, 'kimi', { thinking: true });
    expect(getLLMProviders).toHaveBeenCalledOnce();
    expect(getAgent).not.toHaveBeenCalled();
    expect(vi.mocked(updateChatConfig).mock.lastCall?.[2].config).toEqual({
      thinking: true,
      reasoning_effort: 'max',
    });
    expect(state.events).toEqual(['create', 'config', 'message']);
  });

  it('resolves a cold agent by exact ID and normalizes a supplied config', async () => {
    const { client, wrapper } = setup();
    client.setQueryData(
      [FunctionKeyV2.GET_AGENTS, { ...auth, categoryFilter: 'recently_used' }],
      [],
    );
    await submit(wrapper, 'saved-agent', {
      thinking: false,
      reasoning_effort: 'low',
    });
    expect(getAgent).toHaveBeenCalledWith({ ...auth, agentId: 'saved-agent' });
    expect(vi.mocked(updateChatConfig).mock.lastCall?.[2].config).toEqual({
      thinking: true,
      reasoning_effort: 'low',
    });
  });

  it('sets only required model fields before Prompt Library sends its first message', async () => {
    const { wrapper } = setup();
    await submit(wrapper, 'gemini');
    expect(vi.mocked(updateChatConfig).mock.lastCall?.[2].config).toEqual({
      thinking: true,
      reasoning_effort: 'minimal',
    });
    expect(state.events).toEqual(['create', 'config', 'message']);
    expect(createJob).toHaveBeenCalledOnce();
    expect(sendMessageToJob).toHaveBeenCalledOnce();
  });

  it('uses the full saved agent config as the replacement base when config is omitted', async () => {
    const { wrapper } = setup();
    await submit(wrapper, 'saved-agent');
    expect(vi.mocked(updateChatConfig).mock.lastCall?.[2].config).toEqual({
      ...savedConfig,
      thinking: true,
    });
    expect(savedConfig.thinking).toBe(false);
    expect(state.events).toEqual(['create', 'config', 'message']);
  });

  it('preserves inherited optional agent config by leaving the request omitted', async () => {
    const { wrapper } = setup();
    vi.mocked(getAgent).mockResolvedValueOnce({
      ...savedAgent,
      llm_provider_id: 'luna',
    });
    await submit(wrapper, 'optional-agent');
    expect(updateChatConfig).not.toHaveBeenCalled();
    expect(state.events).toEqual(['create', 'message']);
  });

  it('does not hide an actual job creation failure after metadata fallback', async () => {
    const { wrapper } = setup();
    vi.mocked(getLLMProviders).mockRejectedValueOnce(
      new Error('Metadata unavailable'),
    );
    vi.mocked(getAgent).mockRejectedValueOnce(
      new Error('Metadata unavailable'),
    );
    vi.mocked(createJob).mockRejectedValueOnce(new Error('Create failed'));
    const onError = vi.fn();
    const { result } = renderHook(() => useCreateJob({ onError }), { wrapper });
    await act(async () => {
      await expect(
        result.current.mutateAsync({
          ...auth,
          llmProvider: 'unavailable',
          content: 'Try',
          isHidden: true,
        }),
      ).rejects.toThrow('Create failed');
    });
    expect(onError).toHaveBeenCalledOnce();
    expect(sendMessageToJob).not.toHaveBeenCalled();
  });

  it('uses warm metadata without fetching and keeps an explicit effort choice', async () => {
    const { client, wrapper } = setup();
    client.setQueryData([FunctionKeyV2.GET_LLM_PROVIDERS, auth], providers);
    await submit(wrapper, 'kimi', { thinking: true, reasoning_effort: 'low' });
    expect(getLLMProviders).not.toHaveBeenCalled();
    expect(getAgent).not.toHaveBeenCalled();
    expect(vi.mocked(updateChatConfig).mock.lastCall?.[2].config).toEqual({
      thinking: true,
      reasoning_effort: 'low',
    });
  });

  it('keeps optional thinking off when cold metadata becomes available', async () => {
    const { wrapper } = setup();
    await submit(wrapper, 'luna', {
      thinking: false,
      reasoning_effort: 'high',
    });
    expect(vi.mocked(updateChatConfig).mock.lastCall?.[2].config).toEqual({
      thinking: false,
      reasoning_effort: undefined,
    });
  });

  it.each(['luna', 'custom'])(
    'keeps omitted server defaults for %s',
    async (target) => {
      const { wrapper } = setup();
      await submit(wrapper, target);
      expect(updateChatConfig).not.toHaveBeenCalled();
      expect(state.events).toEqual(['create', 'message']);
    },
  );

  it.each([false, true])(
    'preserves original config omission=%s when metadata fails',
    async (omit) => {
      const { wrapper } = setup();
      vi.mocked(getLLMProviders).mockRejectedValueOnce(
        new Error('Unavailable'),
      );
      vi.mocked(getAgent).mockRejectedValueOnce(new Error('Unavailable'));
      const config = omit
        ? undefined
        : {
            custom_prompt: 'Keep prompt',
            thinking: false,
            reasoning_effort: 'xhigh' as const,
          };
      await submit(wrapper, 'unavailable', config);
      if (omit) expect(updateChatConfig).not.toHaveBeenCalled();
      else
        expect(vi.mocked(updateChatConfig).mock.lastCall?.[2].config).toEqual(
          config,
        );
      expect(sendMessageToJob).toHaveBeenCalledOnce();
    },
  );
});
