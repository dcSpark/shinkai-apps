import {
  setNgrokAuthToken as setNgrokAuthTokenApi,
  setNgrokEnabled,
} from '@shinkai_network/shinkai-message-ts/api/ngrok';
import { type SetNgrokAuthTokenInput } from './types';

export const setNgrokAuthToken = async ({
  nodeAddress,
  token,
  authToken,
}: SetNgrokAuthTokenInput) => {
  await setNgrokAuthTokenApi(nodeAddress, token, authToken);
  await setNgrokEnabled(nodeAddress, token, true);
};
