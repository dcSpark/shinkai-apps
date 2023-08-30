import { UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { archiveJob } from '.';
import { ArchiveJobInput, ArchiveJobOutput } from './types';

type Options = UseMutationOptions<ArchiveJobOutput, Error, ArchiveJobInput>;

export const useArchiveJob = (options?: Options) => {
  const queryClient = useQueryClient();
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
