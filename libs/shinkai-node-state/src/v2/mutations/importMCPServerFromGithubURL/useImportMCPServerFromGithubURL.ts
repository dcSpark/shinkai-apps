import { useMutation, UseMutationOptions } from '@tanstack/react-query';

import { APIError } from '../../types';
import { importMCPServerFromGithubURL } from '.';
import type {
  ImportMCPServerFromGithubURLInput,
  ImportMCPServerFromGithubURLOutput,
} from './types';

type Options = UseMutationOptions<
  ImportMCPServerFromGithubURLOutput,
  APIError,
  ImportMCPServerFromGithubURLInput
>;

export const useImportMCPServerFromGithubURL = (options?: Options) => {
  return useMutation({
    mutationFn: (input: ImportMCPServerFromGithubURLInput) =>
      importMCPServerFromGithubURL(input.nodeAddress, input.token, input.githubUrl),
    ...options,
  });
};
