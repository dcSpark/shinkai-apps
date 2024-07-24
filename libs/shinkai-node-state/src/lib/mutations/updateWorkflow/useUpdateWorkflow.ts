import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { updateWorkflow } from './index';
import { UpdateWorkflowInput, UpdateWorkflowOutput } from './types';

type Options = UseMutationOptions<
  UpdateWorkflowOutput,
  Error,
  UpdateWorkflowInput
>;

export const useUpdateWorkflow = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateWorkflow,
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
