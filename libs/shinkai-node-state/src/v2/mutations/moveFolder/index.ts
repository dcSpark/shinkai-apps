import { moveFolderVR } from '@shinkai_network/shinkai-message-ts/api';
import { moveFolder as moveFolderApi } from '@shinkai_network/shinkai-message-ts/api/vector-fs/index';

import { MoveVRFolderInput } from './types';

export const moveFolder = async ({
  nodeAddress,
  token,
  originPath,
  destinationPath,
}: MoveVRFolderInput) => {
  return await moveFolderApi(nodeAddress, token, {
    origin_path: originPath,
    destination_path: destinationPath,
  });
};
