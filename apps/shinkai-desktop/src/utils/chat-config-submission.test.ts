import { FunctionKeyV2 } from '@shinkai_network/shinkai-node-state/v2/constants';
import { type CreateJobInput } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/types';
import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import {
  normalizeChatThinking,
  normalizeCreateJobInput,
  normalizeUpdateChatConfigInput,
} from './chat-config-submission';

const auth = { nodeAddress: 'http://node', token: 'test-token' };
const kimi = 'togetherai:moonshotai/Kimi-K3';
const minimax = 'togetherai:MiniMaxAI/MiniMax-M3';
const setup = () => {
  const client = new QueryClient();
  client.setQueryData(
    [FunctionKeyV2.GET_LLM_PROVIDERS, auth],
    [
      { id: 'kimi', model: kimi },
      { id: 'minimax', model: minimax },
      { id: 'old', model: 'openai:gpt-5.2' },
    ],
  );
  client.setQueryData(
    [FunctionKeyV2.GET_AGENTS, auth],
    [{ agent_id: 'kimi-agent', llm_provider_id: 'kimi' }],
  );
  return client;
};
const newJob = (effort?: 'medium' | 'max'): CreateJobInput => ({
  ...auth,
  llmProvider: 'kimi',
  content: 'Hello',
  isHidden: false,
  chatConfig: { thinking: true, reasoning_effort: effort, stream: true },
});

describe('chat config submission', () => {
  it('submits the displayed Kimi default for new chat config', () => {
    const input = newJob();
    const result = normalizeCreateJobInput(setup(), input);
    expect(result.chatConfig).toEqual({
      thinking: true,
      reasoning_effort: 'max',
      stream: true,
    });
    expect(input.chatConfig?.reasoning_effort).toBeUndefined();
  });

  it('maps saved Medium to High and keeps an explicit Max selection', () => {
    const client = setup();
    expect(
      normalizeCreateJobInput(client, newJob('medium')).chatConfig
        ?.reasoning_effort,
    ).toBe('high');
    expect(
      normalizeCreateJobInput(client, newJob('max')).chatConfig
        ?.reasoning_effort,
    ).toBe('max');
  });

  it('resolves new agent test chats through the cached underlying provider', () => {
    const input = { ...newJob(), llmProvider: 'kimi-agent' };
    expect(
      normalizeCreateJobInput(setup(), input).chatConfig?.reasoning_effort,
    ).toBe('max');
  });

  it('resolves an agent editor chat when only the individual agent query is loaded', () => {
    const client = setup();
    client.removeQueries({ queryKey: [FunctionKeyV2.GET_AGENTS] });
    client.setQueryData(
      [FunctionKeyV2.GET_AGENT, { ...auth, agentId: 'kimi-agent' }],
      {
        agent_id: 'kimi-agent',
        llm_provider_id: 'kimi',
      },
    );
    expect(
      normalizeCreateJobInput(client, {
        ...newJob(),
        llmProvider: 'kimi-agent',
      }).chatConfig?.reasoning_effort,
    ).toBe('max');
  });

  it('normalizes saved job config and omits effort when thinking is off', () => {
    const client = setup();
    client.setQueryData(
      [FunctionKeyV2.GET_PROVIDER_FROM_JOB, { ...auth, jobId: 'job' }],
      {
        agent: { model: kimi },
        provider_type: 'LLMProvider',
      },
    );
    const input = {
      ...auth,
      jobId: 'job',
      jobConfig: { thinking: true, reasoning_effort: 'medium' as const },
    };
    expect(
      normalizeUpdateChatConfigInput(client, input).jobConfig.reasoning_effort,
    ).toBe('high');
    expect(
      normalizeUpdateChatConfigInput(client, {
        ...input,
        jobConfig: { ...input.jobConfig, thinking: false },
      }).jobConfig.reasoning_effort,
    ).toBeUndefined();
  });

  it('uses a new model selection even when the job cache still has the old model', () => {
    const client = setup();
    client.setQueryData(
      [FunctionKeyV2.GET_PROVIDER_FROM_JOB, { ...auth, jobId: 'job' }],
      {
        agent: { model: 'openai:gpt-5.2' },
        provider_type: 'LLMProvider',
      },
    );
    const input = {
      ...auth,
      jobId: 'job',
      selectedProviderId: 'kimi',
      jobConfig: { thinking: true, reasoning_effort: 'max' as const },
    };
    const result = normalizeUpdateChatConfigInput(client, input);
    expect(result.jobConfig.reasoning_effort).toBe('max');
    expect(result).not.toHaveProperty('selectedProviderId');
    expect(
      normalizeUpdateChatConfigInput(client, {
        ...input,
        selectedProviderId: 'minimax',
      }).jobConfig.reasoning_effort,
    ).toBeUndefined();
  });

  it('does not use model metadata from another node or change custom models', () => {
    const client = setup();
    const input = { ...newJob('medium'), nodeAddress: 'http://other-node' };
    expect(normalizeCreateJobInput(client, input).chatConfig).toBe(
      input.chatConfig,
    );
    const custom = { thinking: true, reasoning_effort: 'max' as const };
    expect(normalizeChatThinking(custom, 'togetherai:custom')).toBe(custom);
  });

  it('applies OpenRouter mandatory reasoning and honors its optional toggle', () => {
    const config = {
      thinking: false,
      reasoning_effort: 'max' as const,
      stream: true,
    };
    expect(
      normalizeChatThinking(config, 'openrouter:openai/gpt-6-astra'),
    ).toEqual({ ...config, thinking: true });
    expect(
      normalizeChatThinking(config, 'openrouter:openai/gpt-6-luna'),
    ).toEqual({ ...config, reasoning_effort: undefined });
    expect(
      normalizeChatThinking(
        { thinking: true, reasoning_effort: 'medium' },
        'openrouter:deepseek/deepseek-v4.1-flash-1017',
      ).reasoning_effort,
    ).toBe('high');
  });

  it('keeps Luna off for both OpenAI routes and preserves xhigh when enabled', () => {
    for (const provider of ['openai', 'openai-legacy']) {
      expect(
        normalizeChatThinking(
          { thinking: false, reasoning_effort: 'xhigh' },
          `${provider}:gpt-6-luna`,
        ),
      ).toEqual({ thinking: false, reasoning_effort: undefined });
      expect(
        normalizeChatThinking(
          { thinking: true, reasoning_effort: 'xhigh' },
          `${provider}:gpt-6-luna`,
        ).reasoning_effort,
      ).toBe('xhigh');
    }
    for (const model of [
      'openrouter:openai/gpt-6-astra',
      'openrouter:anthropic/claude-sonnet-5.5',
    ]) {
      expect(
        normalizeChatThinking(
          { thinking: true, reasoning_effort: 'xhigh' },
          model,
        ).reasoning_effort,
      ).toBe('xhigh');
    }
    expect(
      normalizeChatThinking(
        { thinking: true, reasoning_effort: 'xhigh' },
        'togetherai:moonshotai/Kimi-K3',
      ).reasoning_effort,
    ).toBe('max');
  });

  it('keeps streaming settings while applying forced thinking and toggle-only models', () => {
    expect(
      normalizeChatThinking(
        { thinking: false, stream: true, reasoning_effort: 'high' },
        'grok:grok-4.7',
      ),
    ).toEqual({ thinking: true, stream: true, reasoning_effort: undefined });
    expect(
      normalizeChatThinking(
        { thinking: true, stream: false, reasoning_effort: 'high' },
        minimax,
      ),
    ).toEqual({ thinking: true, stream: false, reasoning_effort: undefined });
  });
});
