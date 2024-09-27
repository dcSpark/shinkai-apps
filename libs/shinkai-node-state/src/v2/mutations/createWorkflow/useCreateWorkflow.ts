import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { createWorkflow } from './index';
import { CreateWorkflowInput, CreateWorkflowOutput } from './types';

type Options = UseMutationOptions<
  CreateWorkflowOutput,
  APIError,
  CreateWorkflowInput
>;

export const useCreateWorkflow = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkflow,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_LIST_WORKFLOW],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
