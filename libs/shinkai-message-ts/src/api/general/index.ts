import { httpClient } from '../../http-client';
import { urlJoin } from '../../utils/url-join';
import { CheckHealthResponse } from './types';

export const checkHealth = async (nodeAddress: string) => {
  const reponse = await httpClient.get(
    urlJoin(nodeAddress, '/v2/health_check'),
    { responseType: 'json' },
  );
  return reponse.data as CheckHealthResponse;
};
