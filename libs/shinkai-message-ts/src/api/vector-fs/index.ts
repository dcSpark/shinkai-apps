import { httpClient } from '../../http-client';
import { urlJoin } from '../../utils/url-join';
import { RetrieveSourceFileRequest, RetrieveSourceFileResponse } from './types';

export const retrieveSourceFile = async (
  nodeAddress: string,
  bearerToken: string,
  payload: RetrieveSourceFileRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/retrieve_source_file'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'blob',
    },
  );
  return response.data as RetrieveSourceFileResponse;
};
