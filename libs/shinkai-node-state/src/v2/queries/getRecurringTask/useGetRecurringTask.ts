import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getRecurringTask } from './index';
import { GetRecurringTaskInput } from './types';

export const useGetRecurringTask = (input: GetRecurringTaskInput) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_RECURRING_TASK, input],
    queryFn: () => getRecurringTask(input),
    enabled: !!input.recurringTaskId,
  });
  return response;
};
