import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetRecurringTasksNextExecutionTimeInput } from './types';
import { getRecurringTasksExecutionTime } from './index';

export const useGetRecurringTaskNextExecutionTime = (
  input: GetRecurringTasksNextExecutionTimeInput,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_RECURRING_TASK, input],
    queryFn: () => getRecurringTasksExecutionTime(input),
  });
  return response;
};
