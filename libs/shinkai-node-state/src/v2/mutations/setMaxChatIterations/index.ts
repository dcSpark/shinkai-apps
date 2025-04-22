import { setPreferences } from '@shinkai_network/shinkai-message-ts/api/methods';

import { SetMaxChatIterationsInput } from './types';

export const setMaxChatIterations = async ({
  nodeAddress,
  token,
  maxIterations,
}: SetMaxChatIterationsInput) => {
  const data = await setPreferences(nodeAddress, token, {
    max_iterations: maxIterations,
  });
  return data;
};
