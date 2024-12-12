import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  CodeLanguage,
  ExecuteToolCodeResponse,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type ExecuteToolCodeInput = Token & {
  nodeAddress: string;
  params: Record<string, any>;
  configs?: Record<string, any>;
  code: string;
  llmProviderId: string;
  tools: string[];
  language: CodeLanguage;
};

export type ExecuteToolCodeOutput = ExecuteToolCodeResponse;
