import { useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getAvailableSharedFolders } from '.';
import { GetAvailableSharedItemsInput, Options } from './types';

export const useGetAvailableSharedFolders = (
  input: GetAvailableSharedItemsInput,
  options?: Options,
) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_AVAILABLE_SHARED_ITEMS, input],
    queryFn: async () => await getAvailableSharedFolders(input),
    ...options,
  });
  return response;
};
