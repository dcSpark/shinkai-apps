import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getRecurringTaskLogs } from './index';
import { GetRecurringTaskLogsInput } from './types';

export const useGetRecurringTaskLogs = (input: GetRecurringTaskLogsInput) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_RECURRING_TASK_LOGS, input],
    queryFn: () => getRecurringTaskLogs(input),
    enabled: !!input.recurringTaskId,
  });
  return response;
};
