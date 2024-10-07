import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  ExportSheetResponse,
  SheetFileFormat,
} from '@shinkai_network/shinkai-message-ts/api/sheet/types';

export type ExportSheetOutput = ExportSheetResponse;

export type ExportSheetInput = Token & {
  nodeAddress: string;
  sheetId: string;
  fileFormat: SheetFileFormat;
};
