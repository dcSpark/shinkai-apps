import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { stopGeneratingLLM } from './index';
import { StopGeneratingLLMInput, StopGeneratingLLMOutput } from './types';

type Options = UseMutationOptions<
  StopGeneratingLLMOutput,
  Error,
  StopGeneratingLLMInput
>;

export const useStopGeneratingLLM = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: stopGeneratingLLM,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_CHAT_CONFIG],
      });

      // Invalidate the chat conversation query using ws

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
