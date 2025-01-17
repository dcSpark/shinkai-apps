import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  CodeLanguage,
  SaveToolCodeResponse,
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
};

export type SaveToolCodeOutput = SaveToolCodeResponse;
