import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { updateChatConfig } from './index';
import { UpdateChatConfigInput, UpdateChatConfigOutput } from './types';

type Options = UseMutationOptions<
  UpdateChatConfigOutput,
  APIError,
  UpdateChatConfigInput
>;

export const useUpdateChatConfig = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateChatConfig,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_CHAT_CONFIG],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
