import {
  QueryObserverOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import axios from 'axios';

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

// Mutations
export const useGalxeRegisterShinkaiDesktopInstallationMutation = (
  options?: UseMutationOptions<
    void,
    Error,
    { address: string; signature: string; combined: string }
  >,
) => {
  return useMutation({
    mutationFn: async ({ address, signature, combined }): Promise<void> => {
      await axios.post(
        `https://dev-backend-hosting.shinkai.com/galxe/register-shinkai-desktop-installation`,
        {
          address,
          signature,
          combined,
        },
      );
    },
    ...options,
  });
};
