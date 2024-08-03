import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { setSheetColumn } from './index';
import { SetSheetColumnInput, SetSheetColumnOutput } from './types';

type Options = UseMutationOptions<
  SetSheetColumnOutput,
  Error,
  SetSheetColumnInput
>;

export const useSetSheetColumn = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setSheetColumn,
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
