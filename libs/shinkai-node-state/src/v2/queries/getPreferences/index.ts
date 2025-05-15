import { getPreferences as getPreferencesApi } from '@shinkai_network/shinkai-message-ts/api/general/index';

import { GetPreferencesInput } from './types';

export const getPreferences = async ({
  nodeAddress,
  token,
}: GetPreferencesInput) => {
  const preferences = await getPreferencesApi(nodeAddress, token);
  return preferences;
};
