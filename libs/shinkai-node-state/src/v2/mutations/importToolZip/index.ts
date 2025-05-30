import { importToolZip as importToolZipApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { type ImportToolFromZipInput } from './types';

export const importToolFromZip = async ({
  nodeAddress,
  token,
  file,
}: ImportToolFromZipInput) => {
  return await importToolZipApi(nodeAddress, token, {
    file,
  });
};
