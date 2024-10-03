import { httpClient } from '../../http-client';
import { urlJoin } from '../../utils/url-join';
import {
  ExportSheetRequest,
  ExportSheetResponse,
  ImportSheetRequest,
  ImportSheetResponse,
  SheetFileFormat,
} from './types';

export const exportSheet = async (
  nodeAddress: string,
  bearerToken: string,
  payload: ExportSheetRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/export_sheet'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as ExportSheetResponse;
};
export const importSheet = async (
  nodeAddress: string,
  bearerToken: string,
  payload: ImportSheetRequest,
) => {
  let content;

  if (payload.type === SheetFileFormat.XLSX) {
    const fileData = await payload.file.arrayBuffer();
    content = Array.from(new Uint8Array(fileData));
  } else if (payload.type === SheetFileFormat.CSV) {
    content = await payload.file.text();
  } else {
    throw new Error('Unsupported file type');
  }

  const data = {
    sheet_data: {
      type: payload.type.toUpperCase(),
      content,
    },
  };

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/import_sheet'),
    data,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as ImportSheetResponse;
};
