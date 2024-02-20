import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { FunctionKey, queryClient } from '../../constants';
import { archiveJob } from '.';
import { ArchiveJobInput, ArchiveJobOutput } from './types';

type Options = UseMutationOptions<ArchiveJobOutput, Error, ArchiveJobInput>;

export const useArchiveJob = (options?: Options) => {
  return useMutation({
    mutationFn: archiveJob,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_INBOXES],
      });

      toast.success('Your conversation has been archived');
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
    onError: (error) => {
      toast.error('Error archiving job', {
        description: error.message,
      });
    },
  });
};
