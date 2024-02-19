import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

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
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
