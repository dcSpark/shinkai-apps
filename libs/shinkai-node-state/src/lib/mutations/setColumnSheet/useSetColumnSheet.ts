import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { setColumnSheet } from './index';
import { SetSheetColumnInput, SetSheetColumnOutput } from './types';

type Options = UseMutationOptions<
  SetSheetColumnOutput,
  Error,
  SetSheetColumnInput
>;

export const useSetColumnSheet = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setColumnSheet,
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
