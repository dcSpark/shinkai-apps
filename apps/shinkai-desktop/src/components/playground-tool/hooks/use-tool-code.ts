import {ChatConversationInfiniteData} from "@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/types";
import {useMemo, useRef, useState} from "react";

import {useChatConversationWithOptimisticUpdates} from "../../../pages/chat/chat-conversation";
import {extractTypeScriptCode} from "../../../pages/create-tool";

export const useToolCode = ({ chatInboxId }: { chatInboxId?: string }) => {
  const [toolCode, setToolCode] = useState<string>('');
  const baseToolCodeRef = useRef<string>('');

  const {
    data,
    fetchPreviousPage,
    hasPreviousPage,
    isChatConversationLoading,
    isFetchingPreviousPage,
    isChatConversationSuccess,
  } = useChatConversationWithOptimisticUpdates({
    inboxId: chatInboxId ?? '',
    forceRefetchInterval: true,
  });

  const chatConversationData: ChatConversationInfiniteData | undefined =
    useMemo(() => {
      if (!data) return;
      const formattedData = data?.pages?.map((page) => {
        return page.map((message) => {
          return {
            ...message,
            content:
              message.role === 'user'
                ? message.content
                .match(/<input_command>([\s\S]*?)<\/input_command>/)?.[1]
                ?.trim() ?? ''
                : message.content,
          };
        });
      });
      return {
        ...data,
        pages: formattedData,
      };
    }, [data]);

  const toolHistory = useMemo(() => {
    const messageList = chatConversationData?.pages.flat() ?? [];
    const toolCodesFound = messageList
      .map((message) => {
        if (
          message.role === 'assistant' &&
          message.status.type === 'complete'
        ) {
          return {
            messageId: message.messageId,
            code: extractTypeScriptCode(message.content) ?? '',
          };
        }
      })
      .filter((item) => !!item);
    return toolCodesFound;
  }, [chatConversationData?.pages]);

  const {
    isToolCodeGenerationPending,
    isToolCodeGenerationSuccess,
    isToolCodeGenerationError,
    isToolCodeGenerationIdle,
    toolCodeGenerationData,
  } = useMemo(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    if (!lastMessage)
      return {
        isToolCodeGenerationPending: false,
        isToolCodeGenerationSuccess: false,
        isToolCodeGenerationIdle: false,
        toolCodeGenerationData: '',
        isToolCodeGenerationError: true,
      };

    let status: 'idle' | 'error' | 'success' | 'pending' = 'idle';
    let toolCodeGeneration = '';
    if (
      lastMessage.role === 'assistant' &&
      lastMessage.status.type === 'running'
    ) {
      status = 'pending';
    }
    if (
      lastMessage.role === 'assistant' &&
      lastMessage.status.type === 'complete'
    ) {
      status = 'success';
      const generatedCode = extractTypeScriptCode(lastMessage?.content) ?? '';
      if (generatedCode) {
        baseToolCodeRef.current = generatedCode;
        toolCodeGeneration = generatedCode;
        setToolCode(generatedCode);
      } else {
        status = 'error';
      }
    }

    return {
      isToolCodeGenerationPending: status === 'pending',
      isToolCodeGenerationSuccess: status === 'success',
      isToolCodeGenerationIdle: status === 'idle',
      toolCodeGenerationData: toolCodeGeneration,
      isToolCodeGenerationError: status === 'error',
    };
  }, [data?.pages]);

  return {
    toolCode,
    setToolCode,
    baseToolCodeRef,
    isToolCodeGenerationPending,
    isToolCodeGenerationSuccess,
    isToolCodeGenerationIdle,
    isToolCodeGenerationError,
    toolCodeGenerationData,
    fetchPreviousPage,
    hasPreviousPage,
    isChatConversationLoading,
    isFetchingPreviousPage,
    isChatConversationSuccess,
    chatConversationData,
    toolHistory,
  };
};
