import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  type CodeLanguage,
  type ExecuteToolCodeResponse,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type ExecuteToolCodeInput = Token & {
  nodeAddress: string;
  params: Record<string, any>;
  configs?: Record<string, any>;
  code: string;
  llmProviderId: string;
  tools: string[];
  language: CodeLanguage;
  xShinkaiAppId: string;
  xShinkaiToolId: string;
  mounts?: string[];
};

export type ExecuteToolCodeOutput = ExecuteToolCodeResponse;
