import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { createJob } from '.';
import { CreateJobInput, CreateJobOutput } from './types';

type Options = UseMutationOptions<CreateJobOutput, Error, CreateJobInput>;

export const useCreateJob = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createJob,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_INBOXES],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
