import { httpClient } from '../http-client';
import { urlJoin } from '../utils/url-join';

export interface NgrokStatusResponse {
  authtoken: string;
  enabled: boolean;
  tunnel?: string;
}

export const getNgrokStatus = async (
  nodeAddress: string,
  bearerToken: string,
): Promise<NgrokStatusResponse> => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/get_ngrok_status'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};

export const setNgrokAuthToken = async (
  nodeAddress: string,
  bearerToken: string,
  authToken: string,
): Promise<void> => {
  await httpClient.post(
    urlJoin(nodeAddress, '/v2/set_ngrok_auth_token'),
    { auth_token: authToken },
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
};

export const setNgrokEnabled = async (
  nodeAddress: string,
  bearerToken: string,
  enabled: boolean,
): Promise<{ tunnel?: string }> => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/set_ngrok_enabled'),
    { enabled },
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};
