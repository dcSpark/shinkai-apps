import {
  createJob,
  getLLMProviders,
  updateChatConfig,
} from '@shinkai_network/shinkai-message-ts/api/jobs/index';
import { toolImplementation } from '@shinkai_network/shinkai-message-ts/api/tools/index';
import { CodeLanguage } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createToolCodeWithModelConfig } from './tool-code-request';

vi.mock('@shinkai_network/shinkai-message-ts/api/jobs/index', () => ({
  createJob: vi.fn(),
  getLLMProviders: vi.fn(),
  updateChatConfig: vi.fn(),
}));
vi.mock('@shinkai_network/shinkai-message-ts/api/tools/index', () => ({
  toolImplementation: vi.fn(),
}));

const input = {
  nodeAddress: 'http://node',
  token: 'test-token',
  llmProviderId: 'selected-provider',
  message: 'Create a tool',
  tools: [],
  language: CodeLanguage.Typescript,
  thinking: false,
};

describe('tool builder model configuration requests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createJob).mockResolvedValue({ job_id: 'new-job' } as never);
    vi.mocked(toolImplementation).mockResolvedValue({} as never);
  });

  it.each([
    ['togetherai:moonshotai/Kimi-K3', false, false, undefined],
    ['togetherai:moonshotai/Kimi-K3', true, true, 'max'],
    ['deepseek:deepseek-v4-pro', false, false, undefined],
    ['deepseek:deepseek-v4-pro', true, true, 'high'],
    ['claude:claude-sonnet-5-5', false, true, 'high'],
    ['togetherai:MiniMaxAI/MiniMax-M3', false, false, undefined],
  ])(
    'normalizes the actual job config for %s with thinking=%s',
    async (model, requestedThinking, thinking, effort) => {
      vi.mocked(getLLMProviders).mockResolvedValue([
        { id: 'other-provider', model: 'openai:gpt-4o' },
        { id: input.llmProviderId, model },
      ] as never);
      await createToolCodeWithModelConfig({
        ...input,
        thinking: requestedThinking,
      });
      expect(createJob).toHaveBeenCalledWith(
        input.nodeAddress,
        input.token,
        expect.objectContaining({ llm_provider: input.llmProviderId }),
      );
      expect(updateChatConfig).toHaveBeenCalledWith(
        input.nodeAddress,
        input.token,
        expect.objectContaining({
          job_id: 'new-job',
          config: expect.objectContaining({
            thinking,
            reasoning_effort: effort,
            web_search_enabled: false,
          }),
        }),
      );
      expect(toolImplementation).toHaveBeenCalledWith(
        input.nodeAddress,
        input.token,
        expect.objectContaining({
          message: expect.objectContaining({ job_id: 'new-job' }),
        }),
      );
    },
  );

  it.each([
    ['claude:claude-haiku-5-5', false, 'low', false, 'low'],
    ['claude:claude-haiku-5-5', false, 'medium', false, 'medium'],
    ['claude:claude-haiku-5-5', false, 'high', false, 'high'],
    ['claude:claude-haiku-5-5', false, 'xhigh', false, 'medium'],
    ['claude:claude-haiku-5-5', false, 'max', false, 'medium'],
    ['claude:claude-sonnet-5-5', false, 'xhigh', true, 'xhigh'],
    ['togetherai:moonshotai/Kimi-K3', true, 'low', true, 'low'],
    ['togetherai:moonshotai/Kimi-K3', false, 'max', false, undefined],
    ['deepseek:deepseek-v4-pro', false, 'high', false, undefined],
    ['deepseek:deepseek-v4-pro', true, 'max', true, 'max'],
  ] as const)(
    'preserves supported explicit settings for %s thinking=%s effort=%s',
    async (model, requestedThinking, requestedEffort, thinking, effort) => {
      vi.mocked(getLLMProviders).mockResolvedValue([
        { id: input.llmProviderId, model },
      ] as never);
      await createToolCodeWithModelConfig({
        ...input,
        thinkingConfig: {
          thinking: requestedThinking,
          reasoning_effort: requestedEffort,
        },
      });
      expect(updateChatConfig).toHaveBeenCalledWith(
        input.nodeAddress,
        input.token,
        expect.objectContaining({
          config: expect.objectContaining({
            thinking,
            reasoning_effort: effort,
          }),
        }),
      );
      expect(toolImplementation).toHaveBeenCalled();
    },
  );

  it('creates the tool with the original settings when metadata is unavailable', async () => {
    vi.mocked(getLLMProviders).mockRejectedValue(new Error('Metadata offline'));
    await createToolCodeWithModelConfig({
      ...input,
      thinkingConfig: { thinking: false, reasoning_effort: 'low' },
    });
    expect(createJob).toHaveBeenCalled();
    expect(updateChatConfig).toHaveBeenCalledWith(
      input.nodeAddress,
      input.token,
      expect.objectContaining({
        config: expect.objectContaining({
          thinking: false,
          reasoning_effort: 'low',
        }),
      }),
    );
    expect(toolImplementation).toHaveBeenCalled();
  });

  it('propagates actual tool API errors after a failed metadata lookup', async () => {
    vi.mocked(getLLMProviders).mockRejectedValue(new Error('Metadata offline'));
    const failure = new Error('Tool API failed');
    vi.mocked(toolImplementation).mockRejectedValue(failure);
    await expect(createToolCodeWithModelConfig(input)).rejects.toBe(failure);
    expect(toolImplementation).toHaveBeenCalledTimes(1);
  });

  it('does not retry creation when a tool API request fails after metadata succeeds', async () => {
    vi.mocked(getLLMProviders).mockResolvedValue([
      { id: input.llmProviderId, model: 'claude:claude-sonnet-5-5' },
    ] as never);
    const failure = new Error('Tool API failed');
    vi.mocked(toolImplementation).mockRejectedValue(failure);
    await expect(createToolCodeWithModelConfig(input)).rejects.toBe(failure);
    expect(createJob).toHaveBeenCalledTimes(1);
    expect(toolImplementation).toHaveBeenCalledTimes(1);
  });

  it('continues an existing job without resetting its configuration', async () => {
    await createToolCodeWithModelConfig({ ...input, jobId: 'existing-job' });
    expect(getLLMProviders).not.toHaveBeenCalled();
    expect(createJob).not.toHaveBeenCalled();
    expect(updateChatConfig).not.toHaveBeenCalled();
    expect(toolImplementation).toHaveBeenCalled();
  });
});
