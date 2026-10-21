import { describe, expect, it } from 'vitest';

import { getThinkingConfig } from './thinking-config';

describe('getThinkingConfig', () => {
  it.each([
    'openai:gpt-6.1-sol',
    'openai-legacy:gpt-6-astra',
    'openai:gpt-6-sol',
    'openai-legacy:gpt-6-sol',
    'openai:gpt-6-luna',
    'openai-legacy:gpt-6-luna',
    'claude:claude-fable-5-1',
    'claude:claude-opus-5-5',
    'claude:claude-sonnet-5-5',
    'gemini:gemini-4-argon',
    'gemini:gemini-3.8-flash',
  ])('keeps mandatory thinking enabled for %s', (model) => {
    expect(getThinkingConfig(model)).toEqual({
      supportsThinking: true,
      forceEnabled: true,
      reasoningLevel: true,
    });
  });

  it.each([
    'claude:claude-haiku-5-5',
    'deepseek:deepseek-flash',
    'deepseek:deepseek-v4-pro',
    'togetherai:deepseek-ai/DeepSeek-V4.1-Flash-1017',
  ])('allows optional thinking with effort for %s', (model) => {
    expect(getThinkingConfig(model)).toEqual({
      supportsThinking: true,
      forceEnabled: false,
      reasoningLevel: true,
    });
  });

  it.each([
    'groq:qwen/qwen3.8-27b',
    'groq:qwen/qwen3.6-27b',
    'ollama:qwen3.5',
    'ollama:qwen3.5:9b',
    'togetherai:Qwen/Qwen3.5-9B',
  ])(
    'omits an effort menu when the adapter does not map it for %s',
    (model) => {
      expect(getThinkingConfig(model)).toEqual({
        supportsThinking: true,
        forceEnabled: false,
        reasoningLevel: false,
      });
    },
  );

  it('hides Grok effort controls that the node removes', () => {
    expect(getThinkingConfig('grok:grok-4.7')).toEqual({
      supportsThinking: true,
      forceEnabled: true,
      reasoningLevel: false,
    });
  });

  it('keeps exact provider IDs and ignores letter case', () => {
    expect(getThinkingConfig('OPENAI:GPT-6.1-SOL')).toEqual(
      getThinkingConfig('openai:gpt-6.1-sol'),
    );
    for (const model of [
      undefined,
      '',
      'gpt-6.1-sol',
      'openai:gpt-6.1-sol-unknown',
      'openai:custom-model',
      'exo:qwen3.5',
    ]) {
      expect(getThinkingConfig(model).supportsThinking).toBe(false);
    }
  });

  it('keeps existing model settings', () => {
    expect(getThinkingConfig('openai:gpt-5.2')).toEqual({
      supportsThinking: true,
      forceEnabled: false,
      reasoningLevel: true,
    });
    expect(getThinkingConfig('deepseek:deepseek-reasoner')).toEqual({
      supportsThinking: true,
      forceEnabled: true,
      reasoningLevel: false,
    });
  });
});
