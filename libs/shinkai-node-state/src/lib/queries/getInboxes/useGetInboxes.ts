import { useQuery } from '@tanstack/react-query';

import { getInboxes } from '.';
import { FunctionKey } from '../../constants';
import { GetInboxesInput, Options } from './types';

export const useGetInboxes = (
  input: GetInboxesInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_INBOXES, input],
    queryFn: async () => getInboxes(input),
    ...options,
  });
  return {
    ...response,
    inboxes: response.data ?? [],
  };
};
