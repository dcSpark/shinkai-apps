import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getRecurringTasks } from './index';
import { GetRecurringTasksInput } from './types';

export const useGetRecurringTasks = (input: GetRecurringTasksInput) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_RECURRING_TASKS, input],
    queryFn: () => getRecurringTasks(input),
  });
  return response;
};
