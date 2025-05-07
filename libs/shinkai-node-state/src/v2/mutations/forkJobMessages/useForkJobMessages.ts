import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { forkJobMessages } from './index';
import { ForkJobMessagesInput, ForkJobMessagesOutput } from './types';

type Options = UseMutationOptions<
  ForkJobMessagesOutput,
  APIError,
  ForkJobMessagesInput
>;

export const useForkJobMessages = (options?: Options) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: forkJobMessages,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [
          FunctionKeyV2.GET_CHAT_CONVERSATION_PAGINATION,
          { inboxId: variables.jobId },
        ],
      });
      
      navigate(`/chat/${encodeURIComponent(response.job_id)}`, { replace: false });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
