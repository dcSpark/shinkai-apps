import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { createTool } from './index';
import { CreateToolInput, CreateToolOutput } from './types';

type Options = UseMutationOptions<CreateToolOutput, Error, CreateToolInput>;

export const useCreateTool = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTool,
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
