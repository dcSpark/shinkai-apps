import {
  OpenToolInCodeEditorRequest,
  OpenToolInCodeEditorResponse,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type OpenToolInCodeEditorInput = {
  nodeAddress: string;
  bearerToken: string;
  xShinkaiAppId: string;
  xShinkaiToolId: string;
  xShinkaiLLMProvider: string;
  payload: OpenToolInCodeEditorRequest;
};

export type OpenToolInCodeEditorOutput = OpenToolInCodeEditorResponse;
