import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  type CodeLanguage,
  type SaveToolCodeResponse,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type SaveToolCodeInput = Token & {
  nodeAddress: string;
  jobId: string;
  metadata: Record<string, any>;
  code?: string;
  assets: string[];
  language: CodeLanguage;
  xShinkaiAppId: string;
  xShinkaiToolId: string;
  xShinkaiOriginalToolRouterKey?: string;
  shouldPrefetchPlaygroundTool?: boolean;
} & {
  name: string;
  description: string;
  version: string;
  tools: string[];
  author: string;
};

export type SaveToolCodeOutput = SaveToolCodeResponse;
