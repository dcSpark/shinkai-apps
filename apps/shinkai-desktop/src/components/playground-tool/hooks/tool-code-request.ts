import { createToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolCode/index';
import { type CreateToolCodeInput } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolCode/types';
import { getLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/index';

import { normalizeChatThinking } from '../../../utils/chat-config-submission';
import { getThinkingConfig } from '../../../utils/thinking-config';

export const createToolCodeWithModelConfig = async (
  input: CreateToolCodeInput,
) => {
  // Existing jobs already have their model configuration.
  if (input.jobId) return createToolCode(input);

  let providers: Awaited<ReturnType<typeof getLLMProviders>>;
  try {
    providers = await getLLMProviders(input);
  } catch {
    // Model metadata is optional; the tool API still validates the request.
    return createToolCode(input);
  }
  const provider = providers.find(({ id }) => id === input.llmProviderId);
  const config = getThinkingConfig(provider?.model);
  if (!config.supportsThinking) return createToolCode(input);
  return createToolCode({
    ...input,
    thinkingConfig: normalizeChatThinking(
      {
        ...input.thinkingConfig,
        thinking: input.thinkingConfig?.thinking ?? input.thinking ?? false,
      },
      provider?.model,
    ),
  });
};
