import {
  type QueryObserverOptions,
  useMutation,
  type UseMutationOptions,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query';
import { getName } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';
import axios, { type AxiosError } from 'axios';

// Queries
export const useGalxeGenerateProofQuery = (
  nodeSignature: string,
  payload: string,
  options?: Omit<QueryObserverOptions, 'queryKey'>,
): UseQueryResult<[string, string], Error> => {
  const query = useQuery({
    ...options,
    queryKey: ['galxe_generate_proof'],
    queryFn: async (): Promise<[string, string]> => {
      return invoke('galxe_generate_proof', {
        nodeSignature,
        payload,
      });
    },
  });
  return { ...query } as UseQueryResult<[string, string], Error>;
};

// Mutations
export const useGalxeRegisterShinkaiDesktopInstallationMutation = (
  options?: UseMutationOptions<
    void,
    AxiosError<{ message: string; error: string }>,
    { address: string; signature: string; combined: string }
  >,
) => {
  return useMutation({
    mutationFn: async ({ address, signature, combined }): Promise<void> => {
      const appName = await getName();
      const baseUrl =
        appName === 'Shinkai Desktop'
          ? 'https://backend-hosting.shinkai.com'
          : 'https://dev-backend-hosting.shinkai.com';
      await axios.post(`${baseUrl}/galxe/shinkai-desktop-installation`, {
        address,
        signature,
        combined,
      });
    },
    ...options,
  });
};
