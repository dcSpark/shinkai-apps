import { moveFsItem as moveFsItemApi } from '@shinkai_network/shinkai-message-ts/api/vector-fs/index';

import { MoveFsItemInput } from './types';

export const moveFsItem = async ({
  nodeAddress,
  token,
  originPath,
  destinationPath,
}: MoveFsItemInput) => {
  return await moveFsItemApi(nodeAddress, token, {
    origin_path: originPath,
    destination_path: destinationPath,
  });
};
