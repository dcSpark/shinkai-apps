import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { importToolFromZip } from './index';
import { ImportToolFromZipInput, ImportToolFromZipOutput } from './types';

type Options = UseMutationOptions<
  ImportToolFromZipOutput,
  APIError,
  ImportToolFromZipInput
>;

export const useImportToolZip = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importToolFromZip,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_LIST_TOOLS],
      });
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
