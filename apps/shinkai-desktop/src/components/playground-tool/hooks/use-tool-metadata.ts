import { ToolMetadata } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import {
  buildInboxIdFromJobId,
  extractJobIdFromInbox,
} from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useCreateToolMetadata } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolMetadata/useCreateToolMetadata';
import React, { useCallback, useEffect, useState } from 'react';

import { useChatConversationWithOptimisticUpdates } from '../../../pages/chat/chat-conversation';
import { useAuth } from '../../../store/auth';
import { ToolMetadataSchema } from '../schemas';
import { parseJsonFromCodeBlock } from '../utils/code';

export const useToolMetadata = ({
  chatInboxId,
  forceGenerateMetadata,
  initialState,
  tools,
  toolCode,
}: {
  chatInboxId?: string;
  toolCode?: string;
  initialState?: {
    metadata: ToolMetadata | null;
    state?: 'idle' | 'pending' | 'success' | 'error';
    error?: string | null;
  };
  tools: string[];
  forceGenerateMetadata: React.MutableRefObject<boolean>;
}) => {
  const [metadataData, setMetadataData] = useState<ToolMetadata | null>(
    initialState?.metadata ?? null,
  );
  const auth = useAuth((state) => state.auth);
  const [error, setError] = useState<string | null>(
    initialState?.error ?? null,
  );
  const [metadataState, setMetadataState] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >(initialState?.state ?? 'idle');

  const [chatInboxIdMetadata, setChatInboxIdMetadata] = useState<
    string | undefined
  >(undefined);

  const { data: metadataChatConversation } =
    useChatConversationWithOptimisticUpdates({
      inboxId: chatInboxIdMetadata ?? '',
      forceRefetchInterval: true,
    });

  const { mutateAsync: createToolMetadata } = useCreateToolMetadata();

  useEffect(() => {
    setMetadataData(initialState?.metadata ?? null);
    setError(initialState?.error ?? null);
    setMetadataState(initialState?.state ?? 'idle');
  }, [initialState?.error, initialState?.metadata, initialState?.state]);

  const regenerateToolMetadata = useCallback(async () => {
    return await createToolMetadata(
      {
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        jobId: extractJobIdFromInbox(chatInboxId ?? '') ?? '',
        tools: tools,
      },
      {
        onSuccess: (data) => {
          setChatInboxIdMetadata(buildInboxIdFromJobId(data.job_id));
        },
      },
    );
  }, [
    auth?.api_v2_key,
    auth?.node_address,
    chatInboxId,
    createToolMetadata,
    tools,
  ]);

  useEffect(() => {
    const metadata = metadataChatConversation?.pages?.at(-1)?.at(-1);

    if (!metadata) {
      return;
    }

    if (metadata?.role === 'assistant' && metadata?.status.type === 'running') {
      setMetadataState('pending');
      return;
    }

    if (
      metadata?.role === 'assistant' &&
      metadata?.status.type === 'complete'
    ) {
      const extractedMetadata = parseJsonFromCodeBlock(metadata.content);
      if (extractedMetadata) {
        try {
          const parsedMetadata = ToolMetadataSchema.parse(
            extractedMetadata,
          ) as ToolMetadata;
          setMetadataData({
            ...parsedMetadata,
            author: auth?.shinkai_identity ?? '',
          });
          setMetadataState('success');
          setError(null);
        } catch (error) {
          setMetadataState('error');
          setError(
            error instanceof Error
              ? 'Invalid Metadata: ' + error.message
              : 'Invalid Metadata: Unknown Error',
          );
        }
      } else {
        setMetadataState('error');
        setError('No JSON code found');
      }
      return;
    }
  }, [auth?.shinkai_identity, metadataChatConversation?.pages]);

  useEffect(() => {
    if (!toolCode || !forceGenerateMetadata.current) return;
    const run = async () => {
      await createToolMetadata(
        {
          nodeAddress: auth?.node_address ?? '',
          token: auth?.api_v2_key ?? '',
          jobId: extractJobIdFromInbox(chatInboxId ?? ''),
          tools: tools,
        },
        {
          onSuccess: (data) => {
            setChatInboxIdMetadata(buildInboxIdFromJobId(data.job_id));
            forceGenerateMetadata.current = false;
          },
        },
      );
    };
    run();
  }, [
    auth?.api_v2_key,
    auth?.node_address,
    chatInboxId,
    toolCode,
    createToolMetadata,
    forceGenerateMetadata,
    tools,
  ]);

  return {
    isMetadataGenerationIdle: metadataState === 'idle',
    isMetadataGenerationPending: metadataState === 'pending',
    isMetadataGenerationSuccess: metadataState === 'success',
    isMetadataGenerationError: metadataState === 'error',
    metadataGenerationError: error,
    metadataGenerationData: metadataData,
    regenerateToolMetadata,
  };
};
