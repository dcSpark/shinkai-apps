import { setNgrokEnabled as setNgrokEnabledApi } from '@shinkai_network/shinkai-message-ts/api/ngrok';
import { type SetNgrokEnabledInput } from './types';

export const setNgrokEnabled = async ({
  nodeAddress,
  token,
  enabled,
}: SetNgrokEnabledInput) => {
  return await setNgrokEnabledApi(nodeAddress, token, enabled);
};
