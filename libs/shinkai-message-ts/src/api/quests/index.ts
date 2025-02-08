import { httpClient } from '../../http-client';
import { urlJoin } from '../../utils/url-join';
import { GetQuestsStatusResponse } from './types';

export const getQuestsStatus = async (
  nodeAddress: string,
  bearerToken: string,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/compute_quests_status'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetQuestsStatusResponse;
};
