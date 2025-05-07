import { GenerateAgentFromPromptResponse } from '@shinkai_network/shinkai-message-ts/api/agents/types';
import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';

export type GenerateAgentFromPromptOutput = GenerateAgentFromPromptResponse;

export type GenerateAgentFromPromptInput = Token & {
  nodeAddress: string;
  llmProviderId: string;
  prompt: string;
};
