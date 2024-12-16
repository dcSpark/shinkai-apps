import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { updateRecurringTask } from './index';
import { UpdateRecurringTaskInput, UpdateRecurringTaskOutput } from './types';

type Options = UseMutationOptions<
  UpdateRecurringTaskOutput,
  APIError,
  UpdateRecurringTaskInput
>;

export const useUpdateRecurringTask = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRecurringTask,
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
