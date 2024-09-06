import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { generateMyEncryptionKeys } from './index';

export const useGetEncryptionKeys = () => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_ENCRYPTION_KEYS],
    queryFn: generateMyEncryptionKeys,
  });
  return { ...response, encryptionKeys: response.data };
};
