import { UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { updateAgentInJob } from '.';
import { UpdateAgentInJobInput, UpdateAgentInJobOutput } from './types';

type Options = UseMutationOptions<
  UpdateAgentInJobOutput,
  APIError,
  UpdateAgentInJobInput
>;

export const useUpdateAgentInJob = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAgentInJob,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [
          FunctionKeyV2.GET_PROVIDER_FROM_JOB,
          { jobId: variables.jobId },
        ],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
