import { importSheet as importSheetApi } from '@shinkai_network/shinkai-message-ts/api/sheet/index';
import { SheetFileFormat } from '@shinkai_network/shinkai-message-ts/api/sheet/types';

import { ImportSheetInput } from './types';

export const importSheet = async ({
  nodeAddress,
  token,
  file,
  fileFormat,
}: ImportSheetInput) => {
  let content;

  if (fileFormat === SheetFileFormat.XLSX) {
    const fileData = await file.arrayBuffer();
    content = Array.from(new Uint8Array(fileData));
  } else if (fileFormat === SheetFileFormat.CSV) {
    content = await file.text();
  } else {
    throw new Error('Unsupported file type');
  }

  return await importSheetApi(nodeAddress, token, {
    sheet_data: {
      content: content,
      type: fileFormat.toUpperCase() as SheetFileFormat,
    },
  });
};
