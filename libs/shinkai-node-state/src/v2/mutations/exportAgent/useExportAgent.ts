import { useMutation, type UseMutationOptions, useQueryClient } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { exportAgent } from '.';
import { ExportAgentInput, ExportAgentOutput } from './types';

type Options = UseMutationOptions<ExportAgentOutput, APIError, ExportAgentInput>;

export const useExportAgent = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: exportAgent,
    ...options,
  });
};
