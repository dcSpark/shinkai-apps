import { useMutation, type UseMutationOptions, useQueryClient } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { importAgentFromUrl } from '.';
import { ImportAgentFromUrlInput, ImportAgentFromUrlOutput } from './types';

type Options = UseMutationOptions<ImportAgentFromUrlOutput, APIError, ImportAgentFromUrlInput>;

export const useImportAgentFromUrl = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importAgentFromUrl,
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
