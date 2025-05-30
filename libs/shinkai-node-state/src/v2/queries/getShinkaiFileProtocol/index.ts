import { getShinkaiFileProtocol as getShinkaiFileProtocolApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { generateFilePreview } from '../../utils/file-preview';
import  {
  type GetShinkaiFileProtocolInput,
  type GetShinkaiFilesProtocolInput,
} from './types';

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

export const getShinkaiFilesProtocol = async ({
  nodeAddress,
  token,
  files,
}: GetShinkaiFilesProtocolInput) => {
  const results = await Promise.all(
    files.map(async (file) => {
      const result = await getShinkaiFileProtocolApi(nodeAddress, token, {
        file,
      });
      return generateFilePreview(file, result);
    }),
  );

  return results;
};
