import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
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
      queryClient.invalidateQueries({
        queryKey: [
          FunctionKeyV2.GET_CHAT_CONVERSATION_PAGINATION,
          { inboxId: buildInboxIdFromJobId(variables.jobId) },
        ],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
