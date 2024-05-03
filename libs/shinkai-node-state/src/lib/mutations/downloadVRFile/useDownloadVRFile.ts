import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

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
    onSuccess: (response, variables, context) => {
      const blob = new Blob([response.data], {
        type: 'application/octet-stream',
      });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;

      a.download = variables.path.split('/').at(-1) + '.vrkai';
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
