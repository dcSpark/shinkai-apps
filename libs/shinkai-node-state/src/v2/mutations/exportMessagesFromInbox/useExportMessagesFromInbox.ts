import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { type APIError } from '../../types';
import {
  type ExportMessagesFromInboxInput,
  type ExportMessagesFromInboxOutput,
} from './types';
import { exportMessagesFromInbox } from '.';

type Options = UseMutationOptions<
  ExportMessagesFromInboxOutput,
  APIError,
  ExportMessagesFromInboxInput
>;

export const useExportMessagesFromInbox = (options?: Options) => {
  return useMutation({
    mutationFn: exportMessagesFromInbox,
    ...options,
  });
};
