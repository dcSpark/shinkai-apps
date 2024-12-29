import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { runTaskNow } from './index';
import { RunTaskNowInput, RunTaskNowOutput } from './types';

type Options = UseMutationOptions<RunTaskNowOutput, APIError, RunTaskNowInput>;

export const useRunTaskNow = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: runTaskNow,
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
