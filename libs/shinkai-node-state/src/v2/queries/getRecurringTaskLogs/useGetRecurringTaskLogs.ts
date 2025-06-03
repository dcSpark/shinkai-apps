import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetRecurringTaskLogsInput } from './types';
import { getRecurringTaskLogs } from './index';

export const useGetRecurringTaskLogs = (input: GetRecurringTaskLogsInput) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_RECURRING_TASK_LOGS, input],
    queryFn: () => getRecurringTaskLogs(input),
    enabled: !!input.recurringTaskId,
  });
  return response;
};
