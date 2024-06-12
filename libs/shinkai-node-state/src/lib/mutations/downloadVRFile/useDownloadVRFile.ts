import { useMutation,type UseMutationOptions } from '@tanstack/react-query';

import { downloadVRFile } from './index';
import { DownloadVRFileInput, DownloadVRFileOutput } from './types';

type Options = UseMutationOptions<
  DownloadVRFileOutput,
  Error,
  DownloadVRFileInput
>;

export const useDownloadVRFile = (options?: Options) => {
  return useMutation({
    mutationFn: downloadVRFile,
    ...options,
  });
};
