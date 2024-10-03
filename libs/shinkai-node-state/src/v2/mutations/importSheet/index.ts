import { importSheet as importSheetApi } from '@shinkai_network/shinkai-message-ts/api/sheet/index';

import { ImportSheetInput } from './types';

export const importSheet = async ({
  nodeAddress,
  token,
  file,
  fileFormat,
}: ImportSheetInput) => {
  return await importSheetApi(nodeAddress, token, {
    file: file,
    type: fileFormat,
  });
};
