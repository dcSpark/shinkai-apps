import { httpClient } from '../../http-client';
import { urlJoin } from '../../utils/url-join';
import { RetrieveSourceFileRequest, RetrieveSourceFileResponse } from './types';

export const retrieveSourceFile = async (
  nodeAddress: string,
  bearerToken: string,
  payload: RetrieveSourceFileRequest,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/retrieve_source_file'),
    {
      params: payload,
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as RetrieveSourceFileResponse;
};
