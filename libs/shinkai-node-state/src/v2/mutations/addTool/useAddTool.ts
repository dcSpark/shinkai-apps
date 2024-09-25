import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { addTool } from './index';
import { AddToolInput, AddToolOutput } from './types';

type Options = UseMutationOptions<AddToolOutput, Error, AddToolInput>;

export const useAddTool = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTool,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_LIST_TOOLS],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
