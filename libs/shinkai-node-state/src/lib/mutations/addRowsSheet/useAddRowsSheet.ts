import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { addRowsSheet } from './index';
import { AddRowsSheetInput, AddRowsSheetOutput } from './types';

type Options = UseMutationOptions<AddRowsSheetOutput, Error, AddRowsSheetInput>;

export const useAddRowsSheet = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addRowsSheet,
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
