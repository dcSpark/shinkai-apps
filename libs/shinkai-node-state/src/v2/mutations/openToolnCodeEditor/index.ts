import { openToolInCodeEditor as openToolInCodeEditorApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { OpenToolInCodeEditorInput, OpenToolInCodeEditorOutput } from './types';

export const openToolInCodeEditor = async ({
  nodeAddress,
  token,
  language,
  xShinkaiAppId,
  xShinkaiToolId,
  xShinkaiLLMProvider,
}: OpenToolInCodeEditorInput): Promise<OpenToolInCodeEditorOutput> => {
  const response = await openToolInCodeEditorApi(
    nodeAddress,
    token,
    { language },
    xShinkaiAppId,
    xShinkaiToolId,
    xShinkaiLLMProvider,
  );
  return response;
};
