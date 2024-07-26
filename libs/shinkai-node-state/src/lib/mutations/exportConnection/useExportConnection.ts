import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { exportConnection } from './index';
import { ExportConnectionInput } from './types';

type Options = UseMutationOptions<string, Error, ExportConnectionInput>;

export const useExportConnection = (options?: Options) => {
  return useMutation({
    mutationFn: exportConnection,
    ...options,
    onSuccess: (response, variables, context) => {
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
