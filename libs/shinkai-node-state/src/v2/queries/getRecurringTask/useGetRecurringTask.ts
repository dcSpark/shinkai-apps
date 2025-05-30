import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetRecurringTaskInput } from './types';
import { getRecurringTask } from './index';

export const useGetRecurringTask = (input: GetRecurringTaskInput) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_RECURRING_TASK, input],
    queryFn: () => getRecurringTask(input),
    enabled: !!input.recurringTaskId,
  });
  return response;
};
