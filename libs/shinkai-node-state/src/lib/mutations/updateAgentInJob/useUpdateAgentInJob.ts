import { UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { updateAgentInJob } from '.';
import { UpdateAgentInJobInput, UpdateAgentInJobOutput } from './types';

type Options = UseMutationOptions<
  UpdateAgentInJobOutput,
  Error,
  UpdateAgentInJobInput
>;

export const useUpdateAgentInJob = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAgentInJob,
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
