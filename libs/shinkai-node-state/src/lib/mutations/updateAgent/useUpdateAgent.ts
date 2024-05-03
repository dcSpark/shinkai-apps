import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { FunctionKey, queryClient } from '../../constants';
import { updateAgent } from '.';
import { UpdateAgentInput, UpdateAgentOutput } from './types';

type Options = UseMutationOptions<UpdateAgentOutput, Error, UpdateAgentInput>;

export const useUpdateAgent = (options?: Options) => {
  return useMutation({
    mutationFn: updateAgent,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_AGENTS],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
