import {
  QueryObserverOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { platform } from '@tauri-apps/api/os';
import { relaunch } from '@tauri-apps/api/process';
import {
  checkUpdate,
  installUpdate,
  onUpdaterEvent,
  UpdateResult,
} from '@tauri-apps/api/updater';

import { useShinkaiNodeKillMutation } from '../shinkai-node-manager/shinkai-node-manager-client';

// Queries
export const useCheckUpdateQuery = (
  options?: Omit<QueryObserverOptions, 'queryKey'>,
): UseQueryResult<UpdateResult, Error> => {
  const query = useQuery({
    ...options,
    queryKey: ['check_update'],
    queryFn: async (): Promise<UpdateResult> => {
      return checkUpdate();
    },
  });
  return { ...query } as UseQueryResult<UpdateResult, Error>;
};

// Mutations
export const useInstallUpdateMutation = (options?: UseMutationOptions) => {
  const queryClient = useQueryClient();
  const { mutateAsync: shinkaiNodeKill } = useShinkaiNodeKillMutation();
  const response = useMutation({
    mutationFn: async (): Promise<void> => {
      const platformName = await platform();
      if (platformName === 'win32') {
        await shinkaiNodeKill();
      }
      try {
        await installUpdate();
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

onUpdaterEvent(({ error, status }) => {
  console.log('Updater event', error, status);
});
