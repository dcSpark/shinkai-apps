import {
  QueryObserverOptions,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';

// Queries
export const useGalxeGenerateDesktopInstallationProofQuery = (
  options?: QueryObserverOptions,
): UseQueryResult<[string, string], Error> => {
  const query = useQuery({
    ...options,
    queryKey: ['galxe_generate_desktop_installation_proof'],
    queryFn: async (): Promise<[string, string]> => {
      return invoke('galxe_generate_desktop_installation_proof');
    },
  });
  return { ...query } as UseQueryResult<[string, string], Error>;
};
