import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { ExecuteToolCodeResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type ExecuteToolCodeInput = Token & {
  nodeAddress: string;
  params: Record<string, any>;
  code: string;
  llmProviderId: string;
  tools: string[];
};

export type ExecuteToolCodeOutput = ExecuteToolCodeResponse;
