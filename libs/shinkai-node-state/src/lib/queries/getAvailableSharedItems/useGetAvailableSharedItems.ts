import { useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getAvailableSharedItems } from '.';
import { GetAvailableSharedItemsInput, Options } from './types';

export const useGetAvailableSharedItems = (
  input: GetAvailableSharedItemsInput,
  options?: Options,
) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_AVAILABLE_SHARED_ITEMS, input],
    queryFn: async () => await getAvailableSharedItems(input),
    ...options,
  });
  return response;
};
