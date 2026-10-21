import { addLLMProvider } from '@shinkai_network/shinkai-message-ts/api/jobs/index';
import { httpClient } from '@shinkai_network/shinkai-message-ts/http-client';
import {
  Models,
  modelsConfig,
} from '@shinkai_network/shinkai-node-state/lib/utils/models';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getModelObject } from './add-ai';

vi.mock('@shinkai_network/shinkai-message-ts/http-client', () => ({
  httpClient: { post: vi.fn(async () => ({ data: {} })) },
}));

describe('Add AI model request serialization', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each(modelsConfig[Models.OpenRouter].modelTypes)(
    'sends the declared OpenRouter variant for $value',
    async ({ value }) => {
      const model = getModelObject(Models.OpenRouter, value);
      expect(model).toEqual({ OpenRouter: { model_type: value } });
      await addLLMProvider('http://node', 'test-token', {
        id: 'selected-model',
        name: 'Selected model',
        full_identity_name: 'node/profile/agent/selected-model',
        api_key: 'provider-key',
        external_url: modelsConfig[Models.OpenRouter].apiUrl,
        model,
      });
      expect(httpClient.post).toHaveBeenCalledWith(
        'http://node/v2/add_llm_provider',
        expect.objectContaining({
          model: `openrouter:${value}`,
          external_url: 'https://openrouter.ai',
        }),
        expect.any(Object),
      );
    },
  );

  it.each([
    [Models.OpenAI, 'OpenAI'],
    [Models.OpenAILegacy, 'OpenAILegacy'],
    [Models.TogetherComputer, 'TogetherAI'],
    [Models.Ollama, 'Ollama'],
    [Models.Gemini, 'Gemini'],
    [Models.Exo, 'Exo'],
    [Models.Claude, 'Claude'],
    [Models.DeepSeek, 'DeepSeek'],
    [Models.Grok, 'Grok'],
    ['custom-provider', 'custom-provider'],
    [Models.Groq, 'groq'],
  ])('preserves the existing %s variant', (provider, variant) => {
    expect(getModelObject(provider, 'Owner/Model:custom')).toEqual({
      [variant]: { model_type: 'Owner/Model:custom' },
    });
  });
});
