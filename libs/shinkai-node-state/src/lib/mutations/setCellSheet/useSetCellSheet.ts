import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { setCellSheet } from './index';
import { SetCellSheetInput, SetCellSheetOutput } from './types';

type Options = UseMutationOptions<SetCellSheetOutput, Error, SetCellSheetInput>;

export const useSetCellSheet = (options?: Options) => {
  return useMutation({
    mutationFn: setCellSheet,
    ...options,
    onSuccess: (response, variables, context) => {
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
