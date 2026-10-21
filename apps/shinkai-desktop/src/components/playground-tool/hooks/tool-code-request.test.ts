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
    ['togetherai:moonshotai/Kimi-K3', false, false, 'max'],
    ['togetherai:moonshotai/Kimi-K3', true, true, 'max'],
    ['deepseek:deepseek-v4-pro', false, false, 'high'],
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

  it('continues an existing job without resetting its configuration', async () => {
    await createToolCodeWithModelConfig({ ...input, jobId: 'existing-job' });
    expect(getLLMProviders).not.toHaveBeenCalled();
    expect(createJob).not.toHaveBeenCalled();
    expect(updateChatConfig).not.toHaveBeenCalled();
    expect(toolImplementation).toHaveBeenCalled();
  });
});
