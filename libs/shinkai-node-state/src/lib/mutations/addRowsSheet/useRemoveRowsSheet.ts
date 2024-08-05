import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { removeRowsSheet } from './index';
import { AddRowsSheetInput, AddRowsSheetOutput } from './types';

type Options = UseMutationOptions<AddRowsSheetOutput, Error, AddRowsSheetInput>;

export const useRemoveRowsSheet = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeRowsSheet,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_SHEET],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
