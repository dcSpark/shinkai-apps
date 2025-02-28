import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  CodeLanguage,
  OpenToolInCodeEditorResponse,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type OpenToolInCodeEditorInput = Token & {
  nodeAddress: string;
  xShinkaiAppId: string;
  xShinkaiToolId: string;
  xShinkaiLLMProvider: string;
  language: CodeLanguage;
};

export type OpenToolInCodeEditorOutput = OpenToolInCodeEditorResponse;
