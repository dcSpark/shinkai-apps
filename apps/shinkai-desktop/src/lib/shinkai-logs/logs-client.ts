import {
  QueryObserverOptions,
  useQuery,
  UseQueryResult
} from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';

export const useRetrieveLogsQuery = (
  options?: Omit<QueryObserverOptions, 'queryKey'>,
): UseQueryResult<string, Error> => {
  const query = useQuery({
    queryKey: ['retrieve_logs'],
    queryFn: (): Promise<string> => invoke('retrieve_logs'),
    ...options,
  });
  return { ...query } as UseQueryResult<string, Error>;
};

export const retrieveLogs = async (): Promise<string> => {
  return invoke('retrieve_logs');
};
