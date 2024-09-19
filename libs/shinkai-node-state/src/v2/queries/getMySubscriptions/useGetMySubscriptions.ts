import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getMySubscriptions } from '.';
import { GetMySubscriptionsInput, Options } from './types';

export const useGetMySubscriptions = (
  input: GetMySubscriptionsInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_MY_SUBSCRIPTIONS, input],
    queryFn: async () => await getMySubscriptions(input),
    ...options,
  });
  return response;
};
