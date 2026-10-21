import { createJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/index';
import { useCreateJob as useCreateJobBase } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob';
import { updateChatConfig } from '@shinkai_network/shinkai-node-state/v2/mutations/updateChatConfig/index';
import { useUpdateChatConfig as useUpdateChatConfigBase } from '@shinkai_network/shinkai-node-state/v2/mutations/updateChatConfig/useUpdateChatConfig';
import { useQueryClient } from '@tanstack/react-query';

import {
  type ChatConfigSubmissionInput,
  prepareCreateJobInput,
  normalizeUpdateChatConfigInput,
} from '../utils/chat-config-submission';

// Resolve metadata and normalize before creating a job or sending its first message.
export const useCreateJob = (
  options?: Parameters<typeof useCreateJobBase>[0],
) => {
  const queryClient = useQueryClient();
  return useCreateJobBase({
    ...options,
    mutationFn: async (input) =>
      createJob(await prepareCreateJobInput(queryClient, input)),
  });
};

export const useUpdateChatConfig = (
  options?: Parameters<typeof useUpdateChatConfigBase>[0],
) => {
  const queryClient = useQueryClient();
  const mutation = useUpdateChatConfigBase({
    ...options,
    mutationFn: (input) =>
      updateChatConfig(
        normalizeUpdateChatConfigInput(
          queryClient,
          input as ChatConfigSubmissionInput,
        ),
      ),
  });
  return {
    ...mutation,
    mutate: (
      input: ChatConfigSubmissionInput,
      options?: Parameters<typeof mutation.mutate>[1],
    ) => mutation.mutate(input, options),
    mutateAsync: (
      input: ChatConfigSubmissionInput,
      options?: Parameters<typeof mutation.mutateAsync>[1],
    ) => mutation.mutateAsync(input, options),
  };
};
