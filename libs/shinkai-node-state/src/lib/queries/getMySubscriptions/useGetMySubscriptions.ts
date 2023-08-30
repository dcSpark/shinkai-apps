import { useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getMySubscriptions } from '.';
import { GetMySubscriptionsInput, Options } from './types';

export const useGetMySubscriptions = (
  input: GetMySubscriptionsInput,
  options?: Options,
) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_MY_SUBSCRIPTIONS, input],
    queryFn: async () => await getMySubscriptions(input),
    ...options,
  });
  return response;
};
