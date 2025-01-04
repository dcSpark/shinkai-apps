import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { downloadFile } from './index';
import { DownloadFileOutput, GetDownloadFileInput } from './types';

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
