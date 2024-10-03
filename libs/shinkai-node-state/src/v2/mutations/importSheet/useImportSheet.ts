import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { APIError } from '../../types';
import { importSheet } from './index';
import { ImportSheetInput, ImportSheetOutput } from './types';

type Options = UseMutationOptions<
  ImportSheetOutput,
  APIError,
  ImportSheetInput
>;

export const useImportSheet = (options?: Options) => {
  return useMutation({
    mutationFn: importSheet,
    ...options,
  });
};
