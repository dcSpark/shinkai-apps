import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { publishTool } from './index';
import { PublishToolInput, PublishToolOutput } from './types';

type Options = UseMutationOptions<
  PublishToolOutput,
  APIError,
  PublishToolInput
>;

export const usePublishTool = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishTool,
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
