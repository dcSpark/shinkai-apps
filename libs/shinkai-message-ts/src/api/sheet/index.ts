import { httpClient } from '../../http-client';
import { urlJoin } from '../../utils/url-join';
import {
  ExportSheetRequest,
  ExportSheetResponse,
  ImportSheetRequest,
  ImportSheetResponse,
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
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/import_sheet'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as ImportSheetResponse;
};
