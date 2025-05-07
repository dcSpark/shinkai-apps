import { generateAgentFromPrompt as generateAgentFromPromptApi } from '@shinkai_network/shinkai-message-ts/api/agents/index';

import { GenerateAgentFromPromptInput } from './types';

export const generateAgentFromPrompt = async ({
  nodeAddress,
  token,
  llmProviderId,
  prompt,
}: GenerateAgentFromPromptInput) => {
  const response = await generateAgentFromPromptApi(nodeAddress, token, {
    llm_provider: llmProviderId,
    prompt,
  });

  return response;
};
