import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { createWorkflow } from './index';
import { CreateWorkflowInput, CreateWorkflowOutput } from './types';

type Options = UseMutationOptions<
  CreateWorkflowOutput,
  Error,
  CreateWorkflowInput
>;

export const useCreateWorkflow = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkflow,
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
