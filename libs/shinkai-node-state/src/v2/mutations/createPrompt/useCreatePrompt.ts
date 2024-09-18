import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { createPrompt } from './index';
import { CreatePromptInput, CreatePromptOutput } from './types';

type Options = UseMutationOptions<
  CreatePromptOutput,
  APIError,
  CreatePromptInput
>;

export const useCreatePrompt = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPrompt,
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
