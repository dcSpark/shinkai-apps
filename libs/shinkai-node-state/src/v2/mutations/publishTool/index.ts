import { publishTool as publishToolApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { type PublishToolInput } from './types';

export const publishTool = async ({
  nodeAddress,
  token,
  toolKey,
}: PublishToolInput) => {
  const response = await publishToolApi(nodeAddress, token, {
    tool_key_path: toolKey,
  });
  return response;
};
