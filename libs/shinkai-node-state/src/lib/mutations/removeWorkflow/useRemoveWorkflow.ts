import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { removeWorkflow } from './index';
import { RemoveWorkflowInput, RemoveWorkflowOutput } from './types';

type Options = UseMutationOptions<
  RemoveWorkflowOutput,
  Error,
  RemoveWorkflowInput
>;

export const useRemoveWorkflow = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeWorkflow,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_LIST_WORKFLOW],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
