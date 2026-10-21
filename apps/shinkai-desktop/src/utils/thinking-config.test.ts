import {
  Models,
  modelsConfig,
} from '@shinkai_network/shinkai-node-state/lib/utils/models';
import { describe, expect, it } from 'vitest';

import {
  getThinkingConfig,
  getReasoningEfforts,
  normalizeReasoningEffort,
} from './thinking-config';

describe('getThinkingConfig', () => {
  it.each([
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

  it.each(['openai', 'openai-legacy'])(
    'uses the verified GPT-6 effort contract for %s',
    (provider) => {
      for (const model of [
        'gpt-6-astra',
        'gpt-6.1-sol',
        'gpt-6-sol',
        'gpt-6-luna',
      ]) {
        const config = getThinkingConfig(`${provider}:${model}`);
        expect(config.supportsThinking).toBe(true);
        expect(config.forceEnabled).toBe(
          ['gpt-6-astra', 'gpt-6.1-sol'].includes(model),
        );
        expect(getReasoningEfforts(config)).toEqual([
          'low',
          'medium',
          'high',
          'xhigh',
          'max',
        ]);
        expect(normalizeReasoningEffort(config, 'xhigh')).toBe('xhigh');
      }
    },
  );

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

  it.each([
    [
      'openai/gpt-6-astra',
      true,
      ['low', 'medium', 'high', 'xhigh', 'max'],
      'medium',
    ],
    [
      'openai/gpt-6.1-sol',
      true,
      ['low', 'medium', 'high', 'xhigh', 'max'],
      'medium',
    ],
    [
      'openai/gpt-6-luna',
      false,
      ['low', 'medium', 'high', 'xhigh', 'max'],
      'medium',
    ],
    [
      'anthropic/claude-sonnet-5.5',
      true,
      ['low', 'medium', 'high', 'xhigh', 'max'],
      'high',
    ],
    ['google/gemini-4-argon', true, ['low', 'medium', 'high'], 'medium'],
    [
      'deepseek/deepseek-v4.1-flash-1017',
      false,
      ['low', 'high', 'max'],
      'high',
    ],
  ] as const)(
    'exposes the OpenRouter contract for %s',
    (id, mandatory, efforts, defaultEffort) => {
      expect(
        modelsConfig[Models.OpenRouter].modelTypes.some(
          (model) => model.value === id,
        ),
      ).toBe(true);
      const config = getThinkingConfig(`openrouter:${id}`);
      expect(config.supportsThinking).toBe(true);
      expect(config.forceEnabled).toBe(mandatory);
      expect(getReasoningEfforts(config)).toEqual(efforts);
      expect(normalizeReasoningEffort(config, undefined)).toBe(defaultEffort);
      for (const effort of efforts)
        expect(normalizeReasoningEffort(config, effort)).toBe(effort);
    },
  );

  it('does not infer OpenRouter support from an underlying provider name', () => {
    expect(getThinkingConfig('openrouter:openai/custom').supportsThinking).toBe(
      false,
    );
    expect(
      getThinkingConfig('openrouter:openai/gpt-6-astra-extra').supportsThinking,
    ).toBe(false);
  });

  it('lists the public Groq successor instead of the retired Qwen model', () => {
    const ids = modelsConfig[Models.Groq].modelTypes.map(
      (model) => model.value,
    );
    expect(ids).toContain('qwen/qwen3.8-27b');
    expect(ids).not.toContain('qwen/qwen3.6-27b');
  });

  it('exposes Kimi K3 thinking with its documented effort levels and default', () => {
    const config = getThinkingConfig('togetherai:moonshotai/Kimi-K3');
    expect(config).toEqual({
      supportsThinking: true,
      forceEnabled: false,
      reasoningLevel: true,
      reasoningEfforts: ['low', 'high', 'max'],
      defaultReasoningEffort: 'max',
      reasoningEffortAliases: { medium: 'high' },
    });
    expect(getReasoningEfforts(config)).toEqual(['low', 'high', 'max']);
    expect(normalizeReasoningEffort(config, undefined)).toBe('max');
    expect(normalizeReasoningEffort(config, 'medium')).toBe('high');
    for (const effort of ['low', 'high', 'max'] as const)
      expect(normalizeReasoningEffort(config, effort)).toBe(effort);
  });

  it('exposes the MiniMax M3 toggle without unsupported effort controls', () => {
    const config = getThinkingConfig('togetherai:MiniMaxAI/MiniMax-M3');
    expect(config).toEqual({
      supportsThinking: true,
      forceEnabled: false,
      reasoningLevel: false,
    });
    expect(getReasoningEfforts(config)).toEqual([]);
    expect(normalizeReasoningEffort(config, 'high')).toBeUndefined();
  });

  it('does not submit a saved model-specific effort after switching to other models', () => {
    const config = getThinkingConfig('openai:gpt-5.2');
    expect(getReasoningEfforts(config)).toEqual(['low', 'medium', 'high']);
    expect(normalizeReasoningEffort(config, 'max')).toBe('medium');
    expect(normalizeReasoningEffort(config, 'medium')).toBe('medium');
    expect(
      normalizeReasoningEffort(getThinkingConfig('togetherai:custom'), 'high'),
    ).toBe('high');
  });

  it('uses the current default after a round trip through a toggle-only model', () => {
    const kimi = getThinkingConfig('togetherai:moonshotai/Kimi-K3');
    const minimax = getThinkingConfig('togetherai:MiniMaxAI/MiniMax-M3');
    const openai = getThinkingConfig('openai:gpt-5.2');
    const cleared = normalizeReasoningEffort(minimax, 'max');
    expect(cleared).toBeUndefined();
    expect(normalizeReasoningEffort(openai, cleared)).toBe('medium');
    expect(normalizeReasoningEffort(kimi, cleared)).toBe('max');
    expect(normalizeReasoningEffort(kimi, 'medium')).toBe('high');
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
