import { zodResolver } from '@hookform/resolvers/zod';
import { CodeLanguage } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useCreateToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolCode/useCreateToolCode';
import { useExecuteToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/executeToolCode/useExecuteToolCode';
import { useUpdateToolCodeImplementation } from '@shinkai_network/shinkai-node-state/v2/mutations/updateToolCodeImplementation/useUpdateToolCodeImplementation';
import { PrismEditor } from 'prism-react-editor';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

import { useChatConversationWithOptimisticUpdates } from '../../../pages/chat/chat-conversation';
import { useAuth } from '../../../store/auth';
import { useSettings } from '../../../store/settings';
import { usePlaygroundStore } from '../context/playground-context';
import { extractCodeByLanguage, extractCodeLanguage } from '../utils/code';

export const createToolCodeFormSchema = z.object({
  message: z.string().min(1),
  llmProviderId: z.string().min(1),
  tools: z.array(z.string()),
  language: z.nativeEnum(CodeLanguage),
});

export type CreateToolCodeFormSchema = z.infer<typeof createToolCodeFormSchema>;

export const useToolForm = (
  initialValues?: Partial<CreateToolCodeFormSchema>,
) => {
  const defaultAgentId = useSettings(
    (settingsStore) => settingsStore.defaultAgentId,
  );

  const form = useForm<CreateToolCodeFormSchema>({
    resolver: zodResolver(createToolCodeFormSchema),
    defaultValues: {
      message: '',
      tools: [],
      language: CodeLanguage.Typescript,
      ...initialValues,
    },
  });

  useEffect(() => {
    if (defaultAgentId) {
      form.setValue('llmProviderId', defaultAgentId);
    }
  }, [form, defaultAgentId]);

  return form;
};

export const useChatConversation = (initialInboxId?: string) => {
  const chatInboxId = usePlaygroundStore((state) => state.chatInboxId);
  const setChatInboxId = usePlaygroundStore((state) => state.setChatInboxId);

  useEffect(() => {
    if (initialInboxId) {
      setChatInboxId(initialInboxId);
    }
  }, [initialInboxId]);

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

  const formattedConversationData = useMemo(() => {
    if (!data) return;
    return {
      ...data,
      pages: data.pages?.map((page) =>
        page.map((message) => ({
          ...message,
          content:
            message.role === 'user'
              ? message.content
                  .match(/<input_command>([\s\S]*?)<\/input_command>/)?.[1]
                  ?.trim() ?? ''
              : message.content,
        })),
      ),
    };
  }, [data]);

  return {
    conversationData: formattedConversationData,
    fetchPreviousPage,
    hasPreviousPage,
    isChatConversationLoading,
    isFetchingPreviousPage,
    isChatConversationSuccess,
  };
};

export const useToolCode = ({
  initialChatInboxId,
  initialState,
  createToolCodeForm,
}: {
  initialChatInboxId?: string;
  initialState?: {
    code: string;
    state?: 'idle' | 'pending' | 'success' | 'error';
    error?: string | null;
  };
  createToolCodeForm: UseFormReturn<CreateToolCodeFormSchema>;
}) => {
  const chatInboxId = usePlaygroundStore((state) => state.chatInboxId);
  const setChatInboxId = usePlaygroundStore((state) => state.setChatInboxId);

  const {
    conversationData,
    fetchPreviousPage,
    hasPreviousPage,
    isChatConversationLoading,
    isFetchingPreviousPage,
    isChatConversationSuccess,
  } = useChatConversation(initialChatInboxId);

  const auth = useAuth((state) => state.auth);

  const baseToolCodeRef = useRef<string>('');
  const codeEditorRef = useRef<PrismEditor | null>(null);
  const metadataEditorRef = useRef<PrismEditor | null>(null);
  const forceGenerateCode = useRef(false);
  const forceGenerateMetadata = useRef(false);

  const [isDirtyCodeEditor, setIsDirtyCodeEditor] = useState(false);
  const resetCounter = usePlaygroundStore((state) => state.resetCounter);
  const setResetCounter = usePlaygroundStore((state) => state.setResetCounter);

  const toolCode = usePlaygroundStore((state) => state.toolCode);
  const setToolCode = usePlaygroundStore((state) => state.setToolCode);
  const toolCodeStatus = usePlaygroundStore((state) => state.toolCodeStatus);
  const setToolCodeStatus = usePlaygroundStore(
    (state) => state.setToolCodeStatus,
  );
  const toolCodeError = usePlaygroundStore((state) => state.toolCodeError);
  const setToolCodeError = usePlaygroundStore(
    (state) => state.setToolCodeError,
  );
  const toolResult = usePlaygroundStore((state) => state.toolResult);
  const setToolResult = usePlaygroundStore((state) => state.setToolResult);

  const currentLanguage = createToolCodeForm.watch('language');

  const toolHistory = useMemo(() => {
    const messageList = conversationData?.pages.flat() ?? [];
    const toolCodesFound = messageList
      .map((message) => {
        const language = extractCodeLanguage(message.content);
        if (
          message.role === 'assistant' &&
          message.status.type === 'complete'
        ) {
          return {
            messageId: message.messageId,
            code:
              extractCodeByLanguage(
                message.content,
                language ?? currentLanguage,
              ) ?? '',
          };
        }
      })
      .filter((item) => !!item)
      .filter((item) => item.code);
    return toolCodesFound;
  }, [conversationData?.pages, currentLanguage]);

  useEffect(() => {
    if (initialState?.code) {
      baseToolCodeRef.current = initialState.code;
      forceGenerateCode.current = false;
      setToolCode(initialState.code);
    }
    if (initialState?.state) {
      setToolCodeStatus(initialState.state);
    }
    if (initialState?.error) {
      setToolCodeError(initialState.error);
    }
  }, [
    initialState?.code,
    initialState?.state,
    initialState?.error,
    setToolCode,
    setToolCodeStatus,
    setToolCodeError,
  ]);

  useEffect(() => {
    const lastMessage = conversationData?.pages?.at(-1)?.at(-1);
    if (!lastMessage || !forceGenerateCode.current) return;

    if (
      lastMessage?.role === 'assistant' &&
      lastMessage?.status.type === 'running'
    ) {
      setToolCodeStatus('pending');
      return;
    }
    if (
      lastMessage?.role === 'assistant' &&
      lastMessage?.status.type === 'complete'
    ) {
      const language = extractCodeLanguage(lastMessage.content);

      const generatedCode =
        extractCodeByLanguage(
          lastMessage?.content,
          language ?? currentLanguage,
        ) ?? '';
      if (generatedCode) {
        baseToolCodeRef.current = generatedCode;
        setToolCode(generatedCode);
        setToolCodeStatus('success');
      } else {
        setToolCodeError('Failed to generate tool code');
        setToolCodeStatus('error');
      }
    }
  }, [conversationData?.pages, currentLanguage]);

  const isToolCodeGenerationPending = toolCodeStatus === 'pending';
  const isToolCodeGenerationSuccess = toolCodeStatus === 'success';
  const isToolCodeGenerationIdle = toolCodeStatus === 'idle';
  const isToolCodeGenerationError = toolCodeStatus === 'error';
  const toolCodeGenerationData = toolCode;
  const toolCodeGenerationError = toolCodeError;

  const executeToolCodeQuery = useExecuteToolCode({
    onSuccess: (data) => {
      setToolResult(data);
    },
  });

  const { mutateAsync: createToolCode } = useCreateToolCode({
    onSuccess: (data) => {
      setChatInboxId(data.inbox);
      setToolCode('');
      forceGenerateCode.current = true;
      forceGenerateMetadata.current = true;
      baseToolCodeRef.current = '';
      setToolResult(null);
      executeToolCodeQuery.reset();
    },
  });

  const { mutateAsync: updateToolCodeImplementation } =
    useUpdateToolCodeImplementation();

  const handleCreateToolCode = async (data: CreateToolCodeFormSchema) => {
    if (!auth) return;

    await createToolCode({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      message: data.message,
      llmProviderId: data.llmProviderId,
      jobId: chatInboxId ? extractJobIdFromInbox(chatInboxId ?? '') : undefined,
      tools: data.tools,
      language: data.language,
    });

    createToolCodeForm.setValue('message', '');
  };

  const handleApplyChangesCodeSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const currentEditorValue = data.get('editor');
    setResetCounter((prev) => prev + 1);
    setIsDirtyCodeEditor(false);
    baseToolCodeRef.current = currentEditorValue as string;
    // forceGenerateMetadata.current = true; // do not force it, user can regenerate it in the UI

    await updateToolCodeImplementation({
      token: auth?.api_v2_key ?? '',
      nodeAddress: auth?.node_address ?? '',
      jobId: extractJobIdFromInbox(chatInboxId ?? ''),
      code: currentEditorValue as string,
    });

    setTimeout(() => {
      setToolCode(currentEditorValue as string);
    }, 100);
  };

  const resetToolCode = () => {
    setIsDirtyCodeEditor(false);
    setResetCounter((prev) => prev + 1);
    forceGenerateMetadata.current = true;
    setTimeout(() => {
      setToolCode(baseToolCodeRef.current);
    }, 0);
  };

  const { __created_files__: toolResultFiles, ...toolResultWithoutFiles } =
    (toolResult || {
      __created_files__: [],
    }) as {
      __created_files__: string[];
      [key: string]: any;
    };

  return {
    toolCode,
    setToolCode,
    baseToolCodeRef,
    isToolCodeGenerationPending,
    isToolCodeGenerationSuccess,
    isToolCodeGenerationIdle,
    isToolCodeGenerationError,
    toolCodeGenerationData,
    toolCodeGenerationError,
    fetchPreviousPage,
    hasPreviousPage,
    isChatConversationLoading,
    isFetchingPreviousPage,
    isChatConversationSuccess,
    chatConversationData: conversationData,
    toolHistory,
    codeEditorRef,
    metadataEditorRef,
    createToolCode,
    executeToolCodeQuery,
    toolResult: toolResultWithoutFiles,
    toolResultFiles: toolResultFiles,
    forceGenerateMetadata,
    isDirtyCodeEditor,
    setIsDirtyCodeEditor,
    resetCounter,
    handleCreateToolCode,
    handleApplyChangesCodeSubmit,
    resetToolCode,
  };
};
