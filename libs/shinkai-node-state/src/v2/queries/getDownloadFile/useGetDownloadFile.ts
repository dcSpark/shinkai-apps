import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { type DownloadFileOutput, type GetDownloadFileInput } from './types';
import { downloadFile } from './index';

type Options = UseMutationOptions<
  DownloadFileOutput,
  Error,
  GetDownloadFileInput
>;

export const useGetDownloadFile = (options?: Options) => {
  return useMutation({
    mutationFn: downloadFile,
    ...options,
  });
};
