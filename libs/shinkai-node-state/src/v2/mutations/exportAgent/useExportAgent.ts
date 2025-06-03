import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { type APIError } from '../../types';
import { type ExportAgentInput, type ExportAgentOutput } from './types';
import { exportAgent } from '.';

type Options = UseMutationOptions<
  ExportAgentOutput,
  APIError,
  ExportAgentInput
>;

export const useExportAgent = (options?: Options) => {
  return useMutation({
    mutationFn: exportAgent,
    ...options,
  });
};
