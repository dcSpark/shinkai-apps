import { useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getInboxes } from '.';
import { GetInboxesInput, GetInboxesOutput, Options } from './types';

export const useGetInboxes = (input: GetInboxesInput, options?: Options) => {
  const response = useQuery<GetInboxesOutput>({
    queryKey: [FunctionKey.GET_INBOXES, input],
    queryFn: async () => getInboxes(input),
    ...options,
  });
  return {
    ...response,
    inboxes: response.data ?? [],
  };
};
