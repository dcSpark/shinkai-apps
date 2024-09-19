import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { removePrompt } from './index';
import { RemovePromptInput, RemovePromptOutput } from './types';

type Options = UseMutationOptions<
  RemovePromptOutput,
  APIError,
  RemovePromptInput
>;

export const useRemovePrompt = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removePrompt,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [
          FunctionKeyV2.GET_LIST_PROMPTS,
          {
            nodeAddress: variables.nodeAddress,
            token: variables.token,
          },
        ],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
