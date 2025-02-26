import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../../lib/constants';
import { APIError } from '../../types';
import { duplicateTool } from '.';
import { DuplicateToolInput, DuplicateToolOutput } from './types';

type Options = UseMutationOptions<
  DuplicateToolOutput,
  APIError,
  DuplicateToolInput
>;

export const useDuplicateTool = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateTool,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_LIST_TOOLS],
      });
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
