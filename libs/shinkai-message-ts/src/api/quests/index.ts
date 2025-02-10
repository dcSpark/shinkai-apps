import { httpClient } from '../../http-client';
import { urlJoin } from '../../utils/url-join';
import { GetQuestsStatusResponse } from './types';

export const getQuestsStatus = async (
  nodeAddress: string,
  bearerToken: string,
) => {
  // use get instead of post (node side)
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/compute_quests_status'),
    null,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetQuestsStatusResponse;
};
