import { copyFsItem as copyFsItemApi } from '@shinkai_network/shinkai-message-ts/api/vector-fs/index';

import { CopyVRItemInput } from './types';

export const copyFsItem = async ({
  nodeAddress,
  token,
  originPath,
  destinationPath,
}: CopyVRItemInput) => {
  return await copyFsItemApi(nodeAddress, token, {
    destination_path: destinationPath,
    origin_path: originPath,
  });
};
