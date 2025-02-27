import { ToolMetadata } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import {
  buildInboxIdFromJobId,
  extractJobIdFromInbox,
} from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useCreateToolMetadata } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolMetadata/useCreateToolMetadata';
import React, { useEffect, useState } from 'react';

import { useChatConversationWithOptimisticUpdates } from '../../../pages/chat/chat-conversation';
import { useAuth } from '../../../store/auth';
import { usePlaygroundStore } from '../context/playground-context';
import { ToolMetadataSchema, ToolMetadataSchemaType } from '../schemas';
import { parseJsonFromCodeBlock } from '../utils/code';

export const useToolMetadata = ({
  forceGenerateMetadata,
  initialState,
  tools,
}: {
  chatInboxId?: string;
  initialState?: {
    metadata: ToolMetadata | null;
    state?: 'idle' | 'pending' | 'success' | 'error';
    error?: string | null;
  };
  tools: string[];
  forceGenerateMetadata: React.MutableRefObject<boolean>;
}) => {
  const auth = useAuth((state) => state.auth);
  const chatInboxId = usePlaygroundStore((state) => state.chatInboxId);
  const toolCode = usePlaygroundStore((state) => state.toolCode);
  const toolMetadata = usePlaygroundStore((state) => state.toolMetadata);
  const setToolMetadata = usePlaygroundStore((state) => state.setToolMetadata);
  const toolMetadataStatus = usePlaygroundStore(
    (state) => state.toolMetadataStatus,
  );

  const setToolMetadataStatus = usePlaygroundStore(
    (state) => state.setToolMetadataStatus,
  );

  const toolMetadataError = usePlaygroundStore(
    (state) => state.toolMetadataError,
  );
  const setToolMetadataError = usePlaygroundStore(
    (state) => state.setToolMetadataError,
  );

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
    setToolMetadata(initialState?.metadata ?? null);
    setToolMetadataError(initialState?.error ?? null);
    setToolMetadataStatus(initialState?.state ?? 'idle');
  }, [initialState?.error, initialState?.metadata, initialState?.state]);

  const regenerateToolMetadata = async () => {
    if (!chatInboxId) return;
    await createToolMetadata(
      {
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        jobId: chatInboxId ? extractJobIdFromInbox(chatInboxId) : '',
        tools: tools,
      },
      {
        onSuccess: (data) => {
          setChatInboxIdMetadata(buildInboxIdFromJobId(data.job_id));
        },
      },
    );
  };

  useEffect(() => {
    const metadata = metadataChatConversation?.pages?.at(-1)?.at(-1);

    if (!metadata) {
      return;
    }

    if (metadata?.role === 'assistant' && metadata?.status.type === 'running') {
      setToolMetadataStatus('pending');
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
          ) as ToolMetadataSchemaType;
          setToolMetadata(parsedMetadata as ToolMetadata);
          setToolMetadataStatus('success');
          setToolMetadataError(null);
        } catch (error) {
          setToolMetadataStatus('error');
          setToolMetadataError(
            error instanceof Error
              ? 'Invalid Metadata: ' + error.message
              : 'Invalid Metadata: Unknown Error',
          );
        }
      } else {
        setToolMetadataStatus('error');
        setToolMetadataError('No metadata JSON code found');
      }
      return;
    }
  }, [auth?.shinkai_identity, metadataChatConversation?.pages]);

  useEffect(() => {
    if (!toolCode || !forceGenerateMetadata.current || !chatInboxId) return;
    const run = async () => {
      await createToolMetadata(
        {
          nodeAddress: auth?.node_address ?? '',
          token: auth?.api_v2_key ?? '',
          jobId: chatInboxId ? extractJobIdFromInbox(chatInboxId) : '',
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
    isMetadataGenerationIdle: toolMetadataStatus === 'idle',
    isMetadataGenerationPending: toolMetadataStatus === 'pending',
    isMetadataGenerationSuccess: toolMetadataStatus === 'success',
    isMetadataGenerationError: toolMetadataStatus === 'error',
    metadataGenerationError: toolMetadataError,
    metadataGenerationData: toolMetadata,
    regenerateToolMetadata,
  };
};
