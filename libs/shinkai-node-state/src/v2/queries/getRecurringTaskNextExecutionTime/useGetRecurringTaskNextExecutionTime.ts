import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getRecurringTasksExecutionTime } from './index';
import { GetRecurringTasksNextExecutionTimeInput } from './types';

export const useGetRecurringTaskNextExecutionTime = (
  input: GetRecurringTasksNextExecutionTimeInput,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_RECURRING_TASK, input],
    queryFn: () => getRecurringTasksExecutionTime(input),
  });
  return response;
};
