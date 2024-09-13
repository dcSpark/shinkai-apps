import {
  QueryObserverOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { platform } from '@tauri-apps/plugin-os';
import { relaunch } from '@tauri-apps/plugin-process';
import { check, Update } from '@tauri-apps/plugin-updater';

import { useShinkaiNodeKillMutation } from '../shinkai-node-manager/shinkai-node-manager-client';

// Queries
export const useCheckUpdateQuery = (
  options?: Omit<QueryObserverOptions, 'queryKey'>,
): UseQueryResult<Update | null, Error> => {
  const query = useQuery({
    ...options,
    queryKey: ['check_update'],
    queryFn: async (): Promise<Update | null> => {
      return check();
    },
  });
  return { ...query } as UseQueryResult<Update | null, Error>;
};

// Mutations
export const useInstallUpdateMutation = (options?: UseMutationOptions) => {
  const queryClient = useQueryClient();
  const { mutateAsync: shinkaiNodeKill } = useShinkaiNodeKillMutation();
  const response = useMutation({
    mutationFn: async (): Promise<void> => {
      const platformName = await platform();
      if (platformName === 'windows') {
        await shinkaiNodeKill();
      }
      try {
        const update = await check();
        if (update?.available) {
          await update.downloadAndInstall();
        }
      } catch (e) {
        console.log(e);
      }
    },
    ...options,
    onSuccess: (...onSuccessParameters) => {
      queryClient.invalidateQueries({
        queryKey: ['check_update'],
      });
      if (options?.onSuccess) {
        options.onSuccess(...onSuccessParameters);
      }
    },
  });
  return { ...response };
};

export const useRelaunchMutation = (options?: UseMutationOptions) => {
  const queryClient = useQueryClient();
  const { mutateAsync: shinkaiNodeKill } = useShinkaiNodeKillMutation();
  const response = useMutation({
    mutationFn: async (): Promise<void> => {
      await shinkaiNodeKill();
      await relaunch();
    },
    ...options,
    onSuccess: (...onSuccessParameters) => {
      queryClient.invalidateQueries({
        queryKey: ['check_update'],
      });
      if (options?.onSuccess) {
        options.onSuccess(...onSuccessParameters);
      }
    },
  });
  return { ...response };
};

