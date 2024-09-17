import {
  QueryObserverOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { relaunch } from '@tauri-apps/plugin-process';
import { check, Update } from '@tauri-apps/plugin-updater';

import { useShinkaiNodeKillMutation } from '../shinkai-node-manager/shinkai-node-manager-client';

// Queries
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
  update?: Update | null;
  downloadState?: DownloadState;
};

const updateState: UpdateState = {};

// Queries
export const useUpdateStateQuery = (
  options?: Omit<QueryObserverOptions, 'queryKey'>,
): UseQueryResult<UpdateState | null, Error> => {
  const query = useQuery({
    ...options,
    queryKey: ['update_state'],
    queryFn: async (): Promise<UpdateState | null> => {
      return updateState;
    },
  });
  return { ...query } as UseQueryResult<UpdateState | null, Error>;
};

export const useCheckUpdateQuery = (
  options?: Omit<QueryObserverOptions, 'queryKey'>,
): UseQueryResult<UpdateState | null, Error> => {
  const queryClient = useQueryClient();
  const query = useQuery({
    ...options,
    queryKey: ['check_update'],
    queryFn: async (): Promise<UpdateState | null> => {
      if (updateState.update) {
        return updateState;
      }
      const update = await check();
      console.log('check update', update);
      queryClient.invalidateQueries({
        queryKey: ['update_state'],
      });
      updateState.update = update;
      return updateState;
    },
  });
  return { ...query } as UseQueryResult<UpdateState | null, Error>;
};

// Mutations
export const useDownloadUpdateMutation = (options?: UseMutationOptions) => {
  const queryClient = useQueryClient();
  const response = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!updateState.update?.available || updateState.downloadState) {
        console.log('update in progress', updateState);
        return;
      }
      try {
        updateState.update?.download((downloadEvent) => {
          console.log('download event', downloadEvent, updateState.update?.rid);
          switch (downloadEvent.event) {
            case 'Started':
              updateState.downloadState = {
                state: 'started',
                data: {
                  contentLength: downloadEvent.data.contentLength,
                },
              };
              break;
            case 'Progress':
              updateState.downloadState = {
                state: 'downloading',
                data: {
                  contentLength: updateState.downloadState?.data?.contentLength,
                  lastChunkLength: downloadEvent.data.chunkLength,
                  accumulatedLength:
                    (updateState.downloadState?.data?.accumulatedLength || 0) +
                    downloadEvent.data.chunkLength,
                  downloadProgressPercent: updateState.downloadState?.data
                    ?.contentLength
                    ? Math.round(
                        (((updateState.downloadState?.data?.accumulatedLength ||
                          0) +
                          downloadEvent.data.chunkLength) /
                          updateState.downloadState.data.contentLength) *
                          100,
                      )
                    : undefined,
                },
              };
              break;
            case 'Finished':
              updateState.downloadState = {
                state: 'finished',
                data: {
                  contentLength: updateState.downloadState?.data?.contentLength,
                  lastChunkLength:
                    updateState.downloadState?.data?.lastChunkLength,
                  accumulatedLength:
                    updateState.downloadState?.data?.lastChunkLength,
                  downloadProgressPercent: 100,
                },
              };
              break;
          }
          queryClient.invalidateQueries({
            queryKey: ['update_state'],
          });
        });
      } catch (e) {
        console.log('error downloading update', e);
        updateState.downloadState = undefined;
      } finally {
        queryClient.invalidateQueries({
          queryKey: ['update_state'],
        });
      }
    },
    ...options,
    onSuccess: (...onSuccessParameters) => {
      queryClient.invalidateQueries({
        queryKey: ['check_update', 'update_state'],
      });
      if (options?.onSuccess) {
        options.onSuccess(...onSuccessParameters);
      }
    },
  });
  return { ...response };
};

export const useApplyUpdateMutation = (options?: UseMutationOptions) => {
  const queryClient = useQueryClient();
  const { mutateAsync: shinkaiNodeKill } = useShinkaiNodeKillMutation();
  const response = useMutation({
    mutationFn: async (): Promise<void> => {
      if (
        updateState.update?.available &&
        updateState.downloadState?.state === 'finished'
      ) {
        console.log('RID', updateState.update.rid);
        await shinkaiNodeKill();
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await updateState.update?.install();
        await relaunch();
      }
    },
    ...options,
    onSuccess: (...onSuccessParameters) => {
      queryClient.invalidateQueries({
        queryKey: ['check_update', 'update_state'],
      });
      if (options?.onSuccess) {
        options.onSuccess(...onSuccessParameters);
      }
    },
  });
  return { ...response };
};
