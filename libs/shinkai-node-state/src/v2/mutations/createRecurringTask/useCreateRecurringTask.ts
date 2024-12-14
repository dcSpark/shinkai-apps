import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { createRecurringTask } from './index';
import { CreateRecurringTaskInput, CreateRecurringTaskOutput } from './types';

type Options = UseMutationOptions<
  CreateRecurringTaskOutput,
  APIError,
  CreateRecurringTaskInput
>;

export const useCreateRecurringTask = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRecurringTask,
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
