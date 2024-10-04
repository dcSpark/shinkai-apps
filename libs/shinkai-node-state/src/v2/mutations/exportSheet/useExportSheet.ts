import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { APIError } from '../../types';
import { exportSheet } from './index';
import { ExportSheetInput, ExportSheetOutput } from './types';

type Options = UseMutationOptions<
  ExportSheetOutput,
  APIError,
  ExportSheetInput
>;

export const useExportSheet = (options?: Options) => {
  return useMutation({
    mutationFn: exportSheet,
    ...options,
  });
};
