import { useMutation, type UseMutationOptions, useQueryClient } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { importAgent } from '.';
import { ImportAgentInput, ImportAgentOutput } from './types';

type Options = UseMutationOptions<ImportAgentOutput, APIError, ImportAgentInput>;

export const useImportAgent = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importAgent,
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
