import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { importTool } from '.';
import { ImportToolInput, ImportToolOutput } from './types';

type Options = UseMutationOptions<ImportToolOutput, APIError, ImportToolInput>;

export const useImportTool = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importTool,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_LIST_TOOLS],
      });
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
