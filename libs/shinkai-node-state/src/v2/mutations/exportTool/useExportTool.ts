import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../../lib/constants';
import { APIError } from '../../types';
import { exportTool } from '.';
import { ExportToolInput, ExportToolOutput } from './types';

type Options = UseMutationOptions<ExportToolOutput, APIError, ExportToolInput>;

export const useExportTool = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: exportTool,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_LIST_TOOLS],
      });
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
