import { type JobConfig } from '@shinkai_network/shinkai-message-ts/api/jobs/types';

import { MODELS_WITH_THINKING_SUPPORT } from './constants';

export type ReasoningEffort = NonNullable<JobConfig['reasoning_effort']>;

export interface ThinkingConfig {
  supportsThinking: boolean;
  forceEnabled: boolean;
  reasoningLevel: boolean;
  reasoningEfforts?: readonly ReasoningEffort[];
  defaultReasoningEffort?: ReasoningEffort;
  reasoningEffortAliases?: Partial<Record<ReasoningEffort, ReasoningEffort>>;
}

/**
 * Utility function for thinking model detection
 * Checks if a model supports thinking capabilities and returns configuration
 */
export const getThinkingConfig = (
  modelName: string | undefined,
): ThinkingConfig => {
  if (!modelName) {
    return {
      supportsThinking: false,
      forceEnabled: false,
      reasoningLevel: false,
    };
  }

  const currentModel = modelName.toLowerCase();
  const supportedModel = Object.keys(MODELS_WITH_THINKING_SUPPORT).find(
    (supportedModel) => {
      const normalizedSupported = supportedModel.toLowerCase();
      return currentModel === normalizedSupported;
    },
  );

  if (!supportedModel) {
    return {
      supportsThinking: false,
      forceEnabled: false,
      reasoningLevel: false,
    };
  }

  const config =
    MODELS_WITH_THINKING_SUPPORT[
      supportedModel as keyof typeof MODELS_WITH_THINKING_SUPPORT
    ];
  return {
    supportsThinking: true,
    forceEnabled: config.forceEnabled,
    reasoningLevel: config.reasoningLevel,
    ...('reasoningEfforts' in config
      ? { reasoningEfforts: config.reasoningEfforts }
      : {}),
    ...('reasoningEffortAliases' in config
      ? { reasoningEffortAliases: config.reasoningEffortAliases }
      : {}),
    ...('defaultReasoningEffort' in config
      ? { defaultReasoningEffort: config.defaultReasoningEffort }
      : {}),
  };
};

export const getReasoningEfforts = (
  config?: ThinkingConfig,
): readonly ReasoningEffort[] =>
  config?.reasoningLevel
    ? (config.reasoningEfforts ?? ['low', 'medium', 'high'])
    : [];

export const normalizeReasoningEffort = (
  config: ThinkingConfig | undefined,
  effort: ReasoningEffort | undefined,
): ReasoningEffort | undefined => {
  if (!config?.supportsThinking) return effort;
  const allowed = getReasoningEfforts(config);
  const normalized = effort
    ? (config?.reasoningEffortAliases?.[effort] ?? effort)
    : undefined;
  return normalized && allowed.includes(normalized)
    ? normalized
    : config?.defaultReasoningEffort;
};
