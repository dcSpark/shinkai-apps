import OLLAMA_MODELS_REPOSITORY from '../lib/shinkai-node-manager/ollama-models-repository.json';

export const SHINKAI_DOCS_URL = 'https://docs.shinkai.com';

export const SHINKAI_TUTORIALS = {
  'add-ai':
    'https://pub-0f9ce9e619a7477aa6e92197a3ec4a1e.r2.dev/assets/agents.mp4',
  'file-explorer':
    'https://pub-5b510bf382c744c093bdd1619d2d6d3e.r2.dev/file-explorer.mp4',
  'scheduled-tasks':
    'https://pub-5b510bf382c744c093bdd1619d2d6d3e.r2.dev/scheduled-tasks.mp4',
  'shinkai-tools':
    'https://pub-0f9ce9e619a7477aa6e92197a3ec4a1e.r2.dev/assets/tools.mp4',
} as const;

export const MODELS_WITH_THINKING_SUPPORT = {
  // Ollama models with thinking support
  ...Object.fromEntries(
    OLLAMA_MODELS_REPOSITORY.filter((model) => model.thinking)
      .map((model) => model.tags)
      .flat()
      .map((tags) => [
        `ollama:${tags.name}`,
        { forceEnabled: true, reasoningLevel: false },
      ]),
  ),

  // Current public API models. Keep provider prefixes equal to ModelPrefix.
  // GPT-6 efforts and optional reasoning follow the OpenAI model contract.
  ...Object.fromEntries(
    ['openai', 'openai-legacy'].flatMap((provider) =>
      ['gpt-6.1-sol', 'gpt-6-sol', 'gpt-6-luna', 'gpt-6-astra'].map((model) => [
        `${provider}:${model}`,
        {
          forceEnabled: model === 'gpt-6-astra' || model === 'gpt-6.1-sol',
          reasoningLevel: true,
          reasoningEfforts: ['low', 'medium', 'high', 'xhigh', 'max'] as const,
          defaultReasoningEffort: 'medium' as const,
        },
      ]),
    ),
  ),
  // OpenRouter exposes its own model-specific reasoning contract.
  // Source: https://openrouter.ai/api/v1/models (reasoning metadata).
  ...Object.fromEntries(
    [
      'openai/gpt-6-astra',
      'openai/gpt-6.1-sol',
      'anthropic/claude-sonnet-5.5',
    ].map((model) => [
      `openrouter:${model}`,
      {
        forceEnabled: true,
        reasoningLevel: true,
        reasoningEfforts: ['low', 'medium', 'high', 'xhigh', 'max'] as const,
        defaultReasoningEffort: model.startsWith('anthropic/')
          ? ('high' as const)
          : ('medium' as const),
      },
    ]),
  ),
  'openrouter:openai/gpt-6-luna': {
    forceEnabled: false,
    reasoningLevel: true,
    reasoningEfforts: ['low', 'medium', 'high', 'xhigh', 'max'],
    defaultReasoningEffort: 'medium',
  },
  'openrouter:google/gemini-4-argon': {
    forceEnabled: true,
    reasoningLevel: true,
    reasoningEfforts: ['low', 'medium', 'high'],
    defaultReasoningEffort: 'medium',
  },
  'openrouter:deepseek/deepseek-v4.1-flash-1017': {
    forceEnabled: false,
    reasoningLevel: true,
    reasoningEfforts: ['low', 'high', 'max'],
    defaultReasoningEffort: 'high',
  },
  // https://platform.claude.com/docs/en/build-with-claude/effort
  ...Object.fromEntries(
    [
      'claude-fable-5-1',
      'claude-opus-5-5',
      'claude-sonnet-5-5',
      'claude-haiku-5-5',
    ].map((model) => [
      `claude:${model}`,
      {
        forceEnabled: model !== 'claude-haiku-5-5',
        reasoningEffortsWhenDisabled:
          model === 'claude-haiku-5-5'
            ? (['low', 'medium', 'high'] as const)
            : undefined,
        reasoningLevel: true,
        reasoningEfforts: ['low', 'medium', 'high', 'xhigh', 'max'] as const,
        defaultReasoningEffort:
          model === 'claude-opus-5-5' || model === 'claude-haiku-5-5'
            ? ('medium' as const)
            : ('high' as const),
      },
    ]),
  ),
  'gemini:gemini-3.8-flash': { forceEnabled: true, reasoningLevel: true },
  'gemini:gemini-3.5-flash-lite': {
    forceEnabled: true,
    reasoningLevel: true,
    reasoningEfforts: ['minimal', 'low', 'medium', 'high'],
    defaultReasoningEffort: 'minimal',
  },
  'gemini:gemini-4-argon': { forceEnabled: true, reasoningLevel: true },
  // https://api-docs.deepseek.com/api/list-models/
  ...Object.fromEntries(
    ['deepseek-flash', 'deepseek-v4-pro'].map((model) => [
      `deepseek:${model}`,
      {
        forceEnabled: false,
        reasoningLevel: true,
        reasoningEfforts: ['low', 'high', 'max'] as const,
        defaultReasoningEffort: 'high' as const,
        reasoningEffortAliases: {
          medium: 'high' as const,
          xhigh: 'high' as const,
        },
      },
    ]),
  ),
  'grok:grok-4.7': { forceEnabled: true, reasoningLevel: false },
  'togetherai:moonshotai/Kimi-K3': {
    forceEnabled: false,
    reasoningLevel: true,
    reasoningEfforts: ['low', 'high', 'max'],
    defaultReasoningEffort: 'max',
    reasoningEffortAliases: { medium: 'high' },
  },
  'togetherai:MiniMaxAI/MiniMax-M3': {
    forceEnabled: false,
    reasoningLevel: false,
  },
  'togetherai:Qwen/Qwen3.5-9B': { forceEnabled: false, reasoningLevel: false },
  // Prefer the current model page's Low/High/Max contract over the generic
  // reasoning guide's older two-level DeepSeek preview description.
  'togetherai:deepseek-ai/DeepSeek-V4-Pro-0813': {
    forceEnabled: false,
    reasoningLevel: true,
    reasoningEfforts: ['low', 'high', 'max'],
    defaultReasoningEffort: 'high',
    reasoningEffortAliases: { medium: 'high', xhigh: 'max' },
  },
  // The node maps these native model aliases to Together's numeric 50/75/100.
  'togetherai:deepseek-ai/DeepSeek-V4.1-Flash-1017': {
    forceEnabled: false,
    reasoningLevel: true,
    reasoningEfforts: ['low', 'high', 'max'],
    defaultReasoningEffort: 'high',
  },
  // The Groq adapter maps the Qwen thinking toggle, but not effort levels.
  'groq:qwen/qwen3.6-27b': { forceEnabled: false, reasoningLevel: false },
  'groq:qwen/qwen3.8-27b': { forceEnabled: false, reasoningLevel: false },
  ...Object.fromEntries(
    [
      'qwen3.5',
      'qwen3.5:latest',
      'qwen3.5:0.8b',
      'qwen3.5:2b',
      'qwen3.5:4b',
      'qwen3.5:9b',
      'qwen3.5:27b',
      'qwen3.5:35b',
      'qwen3.5:122b',
    ].map((model) => [
      `ollama:${model}`,
      { forceEnabled: false, reasoningLevel: false },
    ]),
  ),

  // Claude models
  'claude:claude-opus-4-5': { forceEnabled: false, reasoningLevel: true },
  'claude:claude-sonnet-4-5': { forceEnabled: false, reasoningLevel: true },
  'claude:claude-haiku-4-5': { forceEnabled: false, reasoningLevel: true },
  'claude:claude-opus-4-1-20250805': {
    forceEnabled: false,
    reasoningLevel: true,
  },
  'claude:claude-opus-4-1': { forceEnabled: false, reasoningLevel: true },
  'claude:claude-opus-4-20250514': {
    forceEnabled: false,
    reasoningLevel: true,
  },
  'claude:claude-opus-4-0': { forceEnabled: false, reasoningLevel: true },
  'claude:claude-sonnet-4-20250514': {
    forceEnabled: false,
    reasoningLevel: true,
  },
  'claude:claude-sonnet-4-0': { forceEnabled: false, reasoningLevel: true },
  'claude:claude-3-7-sonnet-20250219': {
    forceEnabled: false,
    reasoningLevel: true,
  },
  'claude:claude-3-7-sonnet-latest': {
    forceEnabled: false,
    reasoningLevel: true,
  },

  // DeepSeek models
  'deepseek:deepseek-reasoner': { forceEnabled: true, reasoningLevel: false },

  // Groq models
  'groq:openai/gpt-oss-20b': { forceEnabled: false, reasoningLevel: true },
  'groq:openai/gpt-oss-120b': { forceEnabled: false, reasoningLevel: true },
  'groq:qwen/qwen3-32b': { forceEnabled: false, reasoningLevel: false },
  'groq:deepseek-r1-distill-llama-70b': {
    forceEnabled: false,
    reasoningLevel: false,
  },

  // OpenAI models
  'openai:gpt-5': { forceEnabled: false, reasoningLevel: true },
  'openai:gpt-5-mini': { forceEnabled: false, reasoningLevel: true },
  'openai:gpt-5-nano': { forceEnabled: false, reasoningLevel: true },
  'openai:gpt-5.1': { forceEnabled: false, reasoningLevel: true },
  'openai:gpt-5.2': { forceEnabled: false, reasoningLevel: true },
  'openai:gpt-5.2-pro': { forceEnabled: false, reasoningLevel: true },
  'openai:o1': { forceEnabled: false, reasoningLevel: true },
  'openai:o1-mini': { forceEnabled: false, reasoningLevel: true },
  'openai:o3': { forceEnabled: false, reasoningLevel: true },
  'openai:o3-mini': { forceEnabled: false, reasoningLevel: true },
  'openai:o4': { forceEnabled: false, reasoningLevel: true },
  'openai:o4-mini': { forceEnabled: false, reasoningLevel: true },

  // Gemini models
  'gemini:gemini-3-pro-preview': { forceEnabled: false, reasoningLevel: true },
  'gemini:gemini-3-flash-preview': {
    forceEnabled: false,
    reasoningLevel: true,
  },
  'gemini:gemini-2.5-pro': { forceEnabled: false, reasoningLevel: true },
  'gemini:gemini-2.5-flash': { forceEnabled: false, reasoningLevel: true },
  'gemini:gemini-2.5-flash-preview-05-20': {
    forceEnabled: false,
    reasoningLevel: true,
  },
  'gemini:gemini-2.5-flash-lite': { forceEnabled: false, reasoningLevel: true },
  'gemini:gemini-2.5-flash-lite-preview-06-17': {
    forceEnabled: false,
    reasoningLevel: true,
  },
  'gemini:gemini-2.0-flash-exp': { forceEnabled: false, reasoningLevel: true },

  // Grok models
  'grok:grok-4-1-fast': { forceEnabled: false, reasoningLevel: true },

  // Shinkai Backend
  'shinkai-backend:free_text_inference': {
    forceEnabled: false,
    reasoningLevel: true,
  },
  'shinkai-backend:standard_text_inference': {
    forceEnabled: false,
    reasoningLevel: true,
  },
  'shinkai-backend:premium_text_inference': {
    forceEnabled: false,
    reasoningLevel: true,
  },
} as const;
