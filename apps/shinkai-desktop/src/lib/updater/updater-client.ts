import {
  QueryObserverOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { Channel, invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { debug } from '@tauri-apps/plugin-log';
import { useEffect } from 'react';

// Types
export type DownloadState = {
  contentLength?: number;
  lastChunkLength?: number;
  accumulatedLength?: number;
  downloadProgressPercent?: number;
};

export type UpdateManagerState =
  | { event: 'no_update_available' }
  | {
      event: 'available';
      data: {
        updateMetadata: {
          version: string;
          currentVersion: string;
        };
      };
    }
  | { event: 'downloading'; data: { downloadState: DownloadState } }
  | { event: 'ready_to_install'; data: { updateBytes: Uint8Array } }
  | { event: 'installing'; data: { updateBytes: Uint8Array } }
  | { event: 'restart_pending' };

export const useFetchUpdateQuery = (
  options?: Omit<
    QueryObserverOptions<UpdateManagerState | null, Error>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<UpdateManagerState | null, Error> => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['fetch_update'],
    queryFn: async () => {
      const updateManagerState =
        await invoke<UpdateManagerState>('fetch_update');
      debug(`fetch update result: ${updateManagerState}`);
      queryClient.invalidateQueries({ queryKey: ['get_update_manager_state'] });
      return updateManagerState;
    },
    ...options,
  });
};

export const useGetUpdateManagerStateQuery = (
  options?: Omit<
    QueryObserverOptions<UpdateManagerState | null, Error>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<UpdateManagerState | null, Error> => {
  return useQuery({
    queryKey: ['get_update_manager_state'],
    queryFn: async () => {
      const updateManagerState = await invoke<UpdateManagerState>(
        'get_update_manager_state',
      );
      return updateManagerState;
    },
    ...options,
  });
};

// Mutations
export const useDownloadUpdateMutation = (options?: UseMutationOptions) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<UpdateManagerState> => {
      let updateManagerState: UpdateManagerState =
        await invoke<UpdateManagerState>('get_update_manager_state');

      const onEvent = new Channel<UpdateManagerState>();
      onEvent.onmessage = (event: UpdateManagerState) => {
        updateManagerState = event;
        queryClient.invalidateQueries({
          queryKey: ['get_update_manager_state'],
        });
      };
      updateManagerState = await invoke<UpdateManagerState>('download_update', {
        onEvent,
      });
      return updateManagerState;
    },
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['get_update_manager_state'],
      });
      options?.onSuccess?.(...args);
    },
  });
};

// Mutations
export const useInstallUpdateMutation = (options?: UseMutationOptions) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<UpdateManagerState> => {
      const updateManagerState =
        await invoke<UpdateManagerState>('install_update');
      return updateManagerState;
    },
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['get_update_manager_state'],
      });
      options?.onSuccess?.(...args);
    },
  });
};

// Mutations
export const useRestartToApplyUpdateMutation = (
  options?: UseMutationOptions,
) => {
  return useMutation({
    mutationFn: async (): Promise<void> => {
      await invoke('restart_to_apply_update');
    },
    ...options,
  });
};

export const useUpdateManagerStateChangedListener = () => {
  const qc = useQueryClient();
  useEffect(() => {
    let listener: UnlistenFn;
    const setupListener = async () => {
      listener = await listen<UpdateManagerState>(
        'update-manager-state-changed',
        (event) => {
          console.log('update-manager-state-changed', event);
          qc.setQueryData(['get_update_manager_state'], event.payload);
        },
      );
    };
    setupListener();
    return () => {
      listener?.();
    };
  }, [qc]);
};
