import { getShinkaiFileProtocol as getShinkaiFileProtocolApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import type { GetShinkaiFileProtocolInput } from './types';

export const getShinkaiFileProtocol = async ({
  nodeAddress,
  token,
  file,
}: GetShinkaiFileProtocolInput) => {
  const result = await getShinkaiFileProtocolApi(nodeAddress, token, {
    file,
  });
  return result;
};
