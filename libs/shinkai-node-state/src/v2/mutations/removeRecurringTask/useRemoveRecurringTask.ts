import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { removeRecurringTask } from './index';
import { RemoveRecurringTaskInput, RemoveRecurringTaskOutput } from './types';

type Options = UseMutationOptions<
  RemoveRecurringTaskOutput,
  APIError,
  RemoveRecurringTaskInput
>;

export const useRemoveRecurringTask = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeRecurringTask,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_RECURRING_TASKS],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
