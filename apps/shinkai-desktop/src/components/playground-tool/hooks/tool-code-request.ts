import { createToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolCode/index';
import { type CreateToolCodeInput } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolCode/types';
import { getLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/index';

import {
  getThinkingConfig,
  normalizeReasoningEffort,
} from '../../../utils/thinking-config';

export const createToolCodeWithModelConfig = async (
  input: CreateToolCodeInput,
) => {
  // Existing jobs already have their model configuration.
  if (input.jobId) return createToolCode(input);

  const providers = await getLLMProviders(input);
  const provider = providers.find(({ id }) => id === input.llmProviderId);
  const config = getThinkingConfig(provider?.model);
  if (!config.supportsThinking) return createToolCode(input);
  return createToolCode({
    ...input,
    thinkingConfig: {
      thinking: config.forceEnabled || (input.thinking ?? false),
      reasoning_effort: normalizeReasoningEffort(config, undefined),
    },
  });
};
