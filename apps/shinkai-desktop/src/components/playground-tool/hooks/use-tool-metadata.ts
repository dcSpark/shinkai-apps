import { ToolMetadata } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useEffect, useRef, useState } from 'react';

import { useChatConversationWithOptimisticUpdates } from '../../../pages/chat/chat-conversation';
import { useAuth } from '../../../store/auth';
import { ToolMetadataSchema } from '../schemas';

export const useToolMetadata = ({
  chatInboxIdMetadata,
  initialState,
}: {
  chatInboxIdMetadata?: string;
  code?: string;
  initialState?: {
    metadata: ToolMetadata | null;
    state?: 'idle' | 'pending' | 'success' | 'error';
    error?: string | null;
  };
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

  const forceGenerateMetadata = useRef(false);

  const { data: metadataChatConversation } =
    useChatConversationWithOptimisticUpdates({
      inboxId: chatInboxIdMetadata ?? '',
      forceRefetchInterval: true,
    });

  useEffect(() => {
    setMetadataData(initialState?.metadata ?? null);
    setError(initialState?.error ?? null);
    setMetadataState(initialState?.state ?? 'idle');
  }, [initialState?.error, initialState?.metadata, initialState?.state]);

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
      const jsonCodeMatch = metadata.content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonCodeMatch) {
        try {
          const parsedJson = JSON.parse(jsonCodeMatch[1].trim());
          const parsedMetadata = ToolMetadataSchema.parse(
            parsedJson,
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

  return {
    isMetadataGenerationIdle: metadataState === 'idle',
    isMetadataGenerationPending: metadataState === 'pending',
    isMetadataGenerationSuccess: metadataState === 'success',
    isMetadataGenerationError: metadataState === 'error',
    metadataGenerationError: error,
    metadataGenerationData: metadataData,
    forceGenerateMetadata,
  };
};
