import { exportSheet as exportSheetApi } from '@shinkai_network/shinkai-message-ts/api/sheet/index';

import { ExportSheetInput } from './types';

export const exportSheet = async ({
  nodeAddress,
  token,
  sheetId,
  fileFormat,
}: ExportSheetInput) => {
  return await exportSheetApi(nodeAddress, token, {
    sheet_id: sheetId,
    file_format: fileFormat,
  });
};
