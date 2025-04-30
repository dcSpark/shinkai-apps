import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { createJob } from '.';
import { CreateJobInput, CreateJobOutput } from './types';

type Options = UseMutationOptions<CreateJobOutput, APIError, CreateJobInput>;

export const useCreateJob = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createJob,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_INBOXES_WITH_PAGINATION],
      });

      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_JOB_SCOPE],
      });
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_VR_FILES],
      });
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_AGENT_INBOXES, variables.llmProvider],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
