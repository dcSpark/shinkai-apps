import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../../lib/constants';
import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { restoreToolConversation } from '.';
import {
  RestoreToolConversationInput,
  RestoreToolConversationOutput,
} from './types';

type Options = UseMutationOptions<
  RestoreToolConversationOutput,
  APIError,
  RestoreToolConversationInput
>;

export const useRestoreToolConversation = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreToolConversation,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_CHAT_CONVERSATION_PAGINATION],
      });
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
