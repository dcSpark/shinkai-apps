import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { removeSheetColumn } from './index';
import { RemoveSheetColumnInput, RemoveSheetColumnOutput } from './types';

type Options = UseMutationOptions<
  RemoveSheetColumnOutput,
  Error,
  RemoveSheetColumnInput
>;

export const useRemoveColumnSheet = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeSheetColumn,
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
