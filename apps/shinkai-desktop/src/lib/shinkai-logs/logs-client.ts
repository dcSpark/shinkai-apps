import {
  QueryObserverOptions,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { BaseDirectory } from '@tauri-apps/api/path';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import { info } from '@tauri-apps/plugin-log';

import { LogEntry } from './log-entry';

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
      const tauriLogs = await retrieveLogs();
      info('retrieved logs from Tauri backend');

      const file = new Blob([tauriLogs], {
        type: 'text/plain',
      });

      const arrayBuffer = await file.arrayBuffer();
      const content = new Uint8Array(arrayBuffer);
      const fileName = `tauri-logs-${new Date().toISOString().replace(/:/g, '-')}.txt`;
      info(`generated log filename: ${fileName}`);

      info('opening save dialog for logs download');
      const savePath = await save({
        defaultPath: fileName,
        filters: [
          {
            name: 'File',
            extensions: ['txt'],
          },
        ],
      });

      if (!savePath) {
        info('logs save dialog cancelled by user');
        throw new Error('logs saving cancelled');
      }

      info(`writing logs to file at path: ${savePath}`);
      await writeFile(savePath, content, {
        baseDir: BaseDirectory.Download,
      });
      info('successfully wrote logs to file');

      return { savePath, fileName };
    },
    ...options,
  });
};

export const retrieveLogs = async (): Promise<string> => {
  return invoke('retrieve_logs');
};
