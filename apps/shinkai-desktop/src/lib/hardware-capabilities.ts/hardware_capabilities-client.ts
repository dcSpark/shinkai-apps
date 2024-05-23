import {
  QueryObserverOptions,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';

export type HardwareCapabilitiesSummary = {
  has_discrete_gpu: boolean;
  memory: number;
  cpus: number;
};

// Queries
export const useHardwareCapabilitiesGetSummaryQuery = (
  options?: QueryObserverOptions,
): UseQueryResult<HardwareCapabilitiesSummary, Error> => {
  const query = useQuery({
    ...options,
    queryKey: ['hardware_capabilities_get_summary'],
    queryFn: async (): Promise<HardwareCapabilitiesSummary> => {
      return invoke('hardware_capabilities_get_summary');
    },
  });
  return { ...query } as UseQueryResult<HardwareCapabilitiesSummary, Error>;
};
