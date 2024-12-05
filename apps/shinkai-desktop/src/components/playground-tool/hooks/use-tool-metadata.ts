import { ToolMetadata } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useMemo, useRef, useState } from 'react';
import { z } from 'zod';

import { useChatConversationWithOptimisticUpdates } from '../../../pages/chat/chat-conversation';
import { ToolMetadataSchema } from '../schemas';

export const useToolMetadata = ({
  chatInboxIdMetadata,
  initialState,
}: {
  chatInboxIdMetadata?: string;
  code?: string;
  initialState?: {
    metadata: ToolMetadata | null;
    isMetadataGenerationPending?: boolean;
    isMetadataGenerationSuccess?: boolean;
    isMetadataGenerationIdle?: boolean;
    isMetadataGenerationError?: boolean;
    metadataGenerationError?: string | null;
  };
}) => {
  const [metadataData, setMetadataData] = useState<ToolMetadata | null>(
    initialState?.metadata ?? null,
  );

  const forceGenerateMetadata = useRef(false);

  const { data: metadataChatConversation } =
    useChatConversationWithOptimisticUpdates({
      inboxId: chatInboxIdMetadata ?? '',
      forceRefetchInterval: true,
    });

  const {
    isMetadataGenerationPending,
    isMetadataGenerationSuccess,
    isMetadataGenerationIdle,
    metadataGenerationData,
    metadataGenerationError,
    isMetadataGenerationError,
  } = useMemo(() => {
    const metadata = metadataChatConversation?.pages?.at(-1)?.at(-1);

    if (initialState && !metadata) {
      return {
        isMetadataGenerationPending:
          initialState.isMetadataGenerationPending ?? false,
        isMetadataGenerationSuccess:
          initialState.isMetadataGenerationSuccess ?? false,
        isMetadataGenerationIdle: initialState.isMetadataGenerationIdle ?? true,
        metadataGenerationData: metadataData,
        isMetadataGenerationError:
          initialState.isMetadataGenerationError ?? false,
        metadataGenerationError: initialState.metadataGenerationError ?? null,
      };
    }
    const isMetadataGenerationIdle = metadata == null;
    const isMetadataGenerationPending =
      metadata?.role === 'assistant' && metadata?.status.type === 'running';
    const isMetadataGenerationSuccess =
      metadata?.role === 'assistant' && metadata?.status.type === 'complete';
    let metadataGenerationData = null;
    let metadataGenerationError: null | string = null;
    if (isMetadataGenerationSuccess) {
      const jsonCodeMatch = metadata.content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonCodeMatch) {
        try {
          const parsedJson = JSON.parse(jsonCodeMatch[1].trim());
          metadataGenerationData = ToolMetadataSchema.parse(
            parsedJson,
          ) as ToolMetadata;
          setMetadataData(metadataGenerationData);
        } catch (error) {
          if (error instanceof Error) {
            metadataGenerationError = 'Invalid Metadata: ' + error.message;
          }
          if (error instanceof z.ZodError) {
            metadataGenerationError =
              'Invalid Metadata: ' +
              error.issues.map((issue) => issue.message).join(', ');
          }
        }
      } else {
        metadataGenerationError = 'No JSON code found';
      }
    }

    return {
      metadataMessageContent: metadata?.content,
      isMetadataGenerationPending,
      isMetadataGenerationSuccess,
      isMetadataGenerationIdle,
      metadataGenerationData,
      isMetadataGenerationError: metadataGenerationError != null,
      metadataGenerationError,
    };
  }, [initialState, metadataChatConversation?.pages]);

  return {
    isMetadataGenerationPending,
    isMetadataGenerationSuccess,
    isMetadataGenerationIdle,
    metadataGenerationData,
    metadataGenerationError,
    isMetadataGenerationError,
    forceGenerateMetadata,
    setMetadataData,
  };
};
