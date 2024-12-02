import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../../lib/constants';
import { APIError } from '../../types';
import { updateToolCodeImplementation } from '.';
import {
  UpdateToolCodeImplementationInput,
  UpdateToolCodeImplementationOutput,
} from './types';

type Options = UseMutationOptions<
  UpdateToolCodeImplementationOutput,
  APIError,
  UpdateToolCodeImplementationInput
>;

export const useUpdateToolCodeImplementation = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateToolCodeImplementation,
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
