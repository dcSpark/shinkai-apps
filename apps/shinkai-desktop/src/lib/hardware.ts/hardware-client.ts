import {
  QueryObserverOptions,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';

export enum RequirementsStatus {
  Unmeet = 'Unmeet',
  StillUsable = 'StillUsable',
  Minimum = 'Minimum',
  Recommended = 'Recommended',
  Optimal = 'Optimal',
}
export type Requirement = {
  cpus: number;
  memory: number;
  discrete_gpu: boolean;
};
export type HardwareSummary = {
  hardware: {
    discrete_gpu: boolean;
    memory: number;
    cpus: number;
  };
  requirements: {
    still_usable: Requirement;
    minimum: Requirement;
    recommended: Requirement;
    optimal: Requirement;
  };
  requirements_status: RequirementsStatus;
};

// Queries
export const useHardwareGetSummaryQuery = (
  options?: QueryObserverOptions,
): UseQueryResult<HardwareSummary, Error> => {
  const query = useQuery({
    ...options,
    queryKey: ['hardware_get_summary'],
    queryFn: async (): Promise<HardwareSummary> => {
      return invoke('hardware_get_summary');
    },
  });
  return { ...query } as UseQueryResult<HardwareSummary, Error>;
};
