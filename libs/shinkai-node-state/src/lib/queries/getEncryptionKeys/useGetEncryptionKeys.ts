import { useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { generateMyEncryptionKeys } from './index';

export const useGetEncryptionKeys = () => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_ENCRYPTION_KEYS],
    queryFn: generateMyEncryptionKeys,
  });
  return { ...response, encryptionKeys: response.data };
};
