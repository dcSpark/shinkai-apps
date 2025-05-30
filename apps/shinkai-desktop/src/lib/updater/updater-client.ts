import {
  type QueryObserverOptions,
  useMutation,
  type UseMutationOptions,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { debug } from '@tauri-apps/plugin-log';
import { platform } from '@tauri-apps/plugin-os';
import { relaunch } from '@tauri-apps/plugin-process';
import { check, type Update } from '@tauri-apps/plugin-updater';

import { useShinkaiNodeKillMutation } from '../shinkai-node-manager/shinkai-node-manager-client';

// Types
export type DownloadState = {
  state: 'started' | 'downloading' | 'finished';
  data: {
    contentLength?: number;
    lastChunkLength?: number;
    accumulatedLength?: number;
    downloadProgressPercent?: number;
  };
} | null;

export type UpdateState = {
  state?: 'available' | 'downloading' | 'restarting';
  update?: Update | null;
  downloadState?: DownloadState;
};

// Singleton state
const updateState: UpdateState = {};

// Queries
export const useUpdateStateQuery = (
  options?: Omit<
    QueryObserverOptions<UpdateState | null, Error>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<UpdateState | null, Error> => {
  return useQuery({
    queryKey: ['update_state'],
    queryFn: async () => updateState,
    notifyOnChangeProps: 'all',
    ...options,
  });
};

export const useCheckUpdateQuery = (
  options?: Omit<
    QueryObserverOptions<UpdateState | null, Error>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<UpdateState | null, Error> => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['check_update'],
    queryFn: async () => {
      if (updateState.update) {
        return updateState;
      }
      const update = await check();
      void debug(`check update available:${update?.available}`);
      updateState.state = update?.available ? 'available' : undefined;
      updateState.update = update;
      void queryClient.invalidateQueries({ queryKey: ['update_state'] });
      return updateState;
    },
    ...options,
  });
};

// Mutations
export const useDownloadUpdateMutation = (options?: UseMutationOptions) => {
  const queryClient = useQueryClient();
  const { mutateAsync: shinkaiNodeKill } = useShinkaiNodeKillMutation();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      if (!updateState.update?.available) {
        void debug(`update not available`);
        return;
      }
      if (updateState.downloadState) {
        void debug(
          `update already in progress ${JSON.stringify(updateState.downloadState)}`,
        );
        return;
      }
      try {
        updateState.state = 'downloading';
        await queryClient.invalidateQueries({ queryKey: ['update_state'] });
        await updateState.update.downloadAndInstall((downloadEvent) => {
          switch (downloadEvent.event) {
            case 'Started':
              updateState.downloadState = {
                state: 'started',
                data: { contentLength: downloadEvent.data.contentLength },
              };
              break;
            case 'Progress': {
              const newDownloadProgress = updateState.downloadState?.data
                ?.contentLength
                ? Math.round(
                    (((updateState.downloadState?.data?.accumulatedLength ||
                      0) +
                      downloadEvent.data.chunkLength) /
                      updateState.downloadState.data.contentLength) *
                      100,
                  )
                : 0;
              updateState.downloadState = {
                state: 'downloading',
                data: {
                  contentLength: updateState.downloadState?.data?.contentLength,
                  lastChunkLength: downloadEvent.data.chunkLength,
                  accumulatedLength:
                    (updateState.downloadState?.data?.accumulatedLength || 0) +
                    downloadEvent.data.chunkLength,
                  downloadProgressPercent: newDownloadProgress,
                },
              };
              break;
            }
            case 'Finished':
              updateState.downloadState = {
                state: 'finished',
                data: {
                  ...updateState.downloadState?.data,
                  downloadProgressPercent: 100,
                },
              };
              void shinkaiNodeKill();
              break;
          }
          void queryClient.invalidateQueries(
            { queryKey: ['update_state'] },
            { cancelRefetch: false },
          );
        });
      } catch (e) {
        console.error('Error downloading update', e);
        updateState.state = updateState.update ? 'available' : undefined;
        updateState.downloadState = undefined;
        void queryClient.invalidateQueries({ queryKey: ['update_state'] });
        return;
      }

      updateState.state = 'restarting';
      void queryClient.invalidateQueries({ queryKey: ['update_state'] });

      if (platform() !== 'windows') {
        await relaunch();
      }
    },
    ...options,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({
        queryKey: ['check_update', 'update_state'],
      });
      options?.onSuccess?.(...args);
    },
  });
};
