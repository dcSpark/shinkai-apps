import { httpClient } from '../../http-client';
import { urlJoin } from '../../utils/url-join';
import { ExportSheetRequest, ExportSheetResponse } from './types';

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
