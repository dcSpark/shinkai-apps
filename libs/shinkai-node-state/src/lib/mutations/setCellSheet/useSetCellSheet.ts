import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { setCellSheet } from './index';
import { SetCellSheetInput, SetCellSheetOutput } from './types';

type Options = UseMutationOptions<SetCellSheetOutput, Error, SetCellSheetInput>;

export const useSetCellSheet = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setCellSheet,
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
