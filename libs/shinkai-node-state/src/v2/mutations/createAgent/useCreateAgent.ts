import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { createAgent } from './index';
import { CreateAgentInput, CreateAgentOutput } from './types';

type Options = UseMutationOptions<
  CreateAgentOutput,
  APIError,
  CreateAgentInput
>;

export const useCreateAgent = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAgent,
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
