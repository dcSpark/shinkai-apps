import { retrieveSourceFile as retrieveSourceFileApi } from '@shinkai_network/shinkai-message-ts/api/vector-fs/index';

import { RetrieveSourceFileInput } from './types';

export const retrieveSourceFile = async ({
  nodeAddress,
  token,
  filePath,
}: RetrieveSourceFileInput) => {
  return await retrieveSourceFileApi(nodeAddress, token, {
    path: filePath,
  });
};
