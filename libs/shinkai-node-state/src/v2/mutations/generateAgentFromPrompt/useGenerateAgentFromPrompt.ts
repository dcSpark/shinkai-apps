import {
  useMutation,
  type UseMutationOptions,
  // useQueryClient,
} from '@tanstack/react-query';

// import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { generateAgentFromPrompt } from './index';
import {
  GenerateAgentFromPromptInput,
  GenerateAgentFromPromptOutput,
} from './types';

type Options = UseMutationOptions<
  GenerateAgentFromPromptOutput,
  APIError,
  GenerateAgentFromPromptInput
>;

export const useGenerateAgentFromPrompt = (options?: Options) => {
  // const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateAgentFromPrompt,
    ...options,
    onSuccess: (response, variables, context) => {
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
