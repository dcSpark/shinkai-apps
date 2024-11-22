import { UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { removeAgent } from '.';
import { RemoveAgentInput, RemoveAgentOutput } from './types';

type Options = UseMutationOptions<
  RemoveAgentOutput,
  APIError,
  RemoveAgentInput
>;

export const useRemoveAgent = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeAgent,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_AGENTS],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
