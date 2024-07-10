import { useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getSubscriptionNotifications } from '.';
import { GetSubscriptionNotificationsInput, Options } from './types';

export const useGetSubscriptionNotifications = (
  input: GetSubscriptionNotificationsInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_SUBSCRIPTION_NOTIFICATIONS, input],
    queryFn: async () => await getSubscriptionNotifications(input),
    ...options,
  });
  return response;
};
