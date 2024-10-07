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

export type ImportSheetRequest = {
  sheet_name: string;
  sheet_data: {
    type: SheetFileFormat;
    content: string | number[]; //binary data
  };
};

export type ImportSheetResponse = {
  sheet_id: string;
};
