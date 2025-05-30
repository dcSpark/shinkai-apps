import {
  type QueryObserverOptions,
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';

import { save } from '@tauri-apps/plugin-dialog';

import { info } from '@tauri-apps/plugin-log';

import { type LogEntry } from './log-entry';

export const useRetrieveLogsQuery = (
  options?: Omit<QueryObserverOptions, 'queryKey'>,
): UseQueryResult<LogEntry[], Error> => {
  const query = useQuery({
    queryKey: ['retrieve_logs'],
    queryFn: (): Promise<LogEntry[]> => invoke('retrieve_logs'),
    ...options,
  });
  return { ...query } as UseQueryResult<LogEntry[], Error>;
};

export const useDownloadTauriLogsMutation = (
  options?: UseMutationOptions<
    { savePath: string; fileName: string },
    Error,
    void
  >,
): UseMutationResult<{ savePath: string; fileName: string }, Error, void> => {
  return useMutation({
    mutationFn: async (): Promise<{ savePath: string; fileName: string }> => {
      const fileName = `shinkai-logs-${new Date().toISOString().replace(/:/g, '-')}.log`;

      void info('opening save dialog for logs download');
      const savePath = await save({
        defaultPath: fileName,
        filters: [
          {
            name: 'File',
            extensions: ['log'],
          },
        ],
      });

      if (!savePath) {
        void info('logs save dialog cancelled by user');
        throw new Error('logs saving cancelled');
      }

      void info(`writing logs to file at path: ${savePath}`);
      await invoke('download_logs', { savePath });
      void info(`successfully wrote logs to file at path: ${savePath}`);

      return { savePath, fileName };
    },
    ...options,
  });
};

export const retrieveLogs = async (): Promise<LogEntry[]> => {
  return invoke('retrieve_logs');
};
