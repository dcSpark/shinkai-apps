export enum SheetFileFormat {
  CSV = 'csv',
  XLSX = 'xlsx',
}

export type ExportSheetRequest = {
  sheet_id: string;
  file_format: SheetFileFormat;
};
export type ExportSheetResponse = {
  type: string;
  content: string | ArrayBuffer;
};
