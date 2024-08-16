import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { removeSheet } from './index';
import { CreateSheetOutput, RemoveSheetInput } from './types';

type Options = UseMutationOptions<CreateSheetOutput, Error, RemoveSheetInput>;

export const useRemoveSheet = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeSheet,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_USER_SHEETS],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
