import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { createSheet } from './index';
import { CreateSheetInput, CreateSheetOutput } from './types';

type Options = UseMutationOptions<CreateSheetOutput, Error, CreateSheetInput>;

export const useCreateSheet = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSheet,
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
