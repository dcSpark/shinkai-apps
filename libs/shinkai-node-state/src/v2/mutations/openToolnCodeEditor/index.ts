import { openToolInCodeEditor as openToolInCodeEditorApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { OpenToolInCodeEditorInput, OpenToolInCodeEditorOutput } from './types';

export const openToolInCodeEditor = async (
  input: OpenToolInCodeEditorInput,
): Promise<OpenToolInCodeEditorOutput> => {
  const response = await openToolInCodeEditorApi(
    input.nodeAddress,
    input.bearerToken,
    input.payload,
    input.xShinkaiAppId,
    input.xShinkaiToolId,
    input.xShinkaiLLMProvider,
  );
  return response;
};
