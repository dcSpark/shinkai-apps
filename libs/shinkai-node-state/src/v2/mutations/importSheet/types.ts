import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { ImportSheetResponse } from '@shinkai_network/shinkai-message-ts/api/sheet/types';

export type ImportSheetOutput = ImportSheetResponse;

export type ImportSheetInput = Token & {
  nodeAddress: string;
  sheetData: string | ArrayBuffer;
};
