import { importSheet as importSheetApi } from '@shinkai_network/shinkai-message-ts/api/sheet/index';

import { ImportSheetInput } from './types';

export const importSheet = async ({
  nodeAddress,
  token,
  sheetData,
}: ImportSheetInput) => {
  return await importSheetApi(nodeAddress, token, {
    sheet_data: sheetData,
  });
};
