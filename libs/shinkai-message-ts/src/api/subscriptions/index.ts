import { httpClient } from '../../http-client';
import { urlJoin } from '../../utils/url-join';
import { GetMySubscriptionsResponse } from './types';

export const getMySubscriptions = async (
  nodeAddress: string,
  bearerToken: string,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/my_subscriptions'),
    {},
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetMySubscriptionsResponse;
};

export const getMySharedFolders = async (
  nodeAddress: string,
  bearerToken: string,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/available_shared_items'),
    {},
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};
