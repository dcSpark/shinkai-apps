import { zodResolver } from '@hookform/resolvers/zod';
import {
  CodeLanguage,
  ToolMetadata,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useCreateToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolCode/useCreateToolCode';
import { useExecuteToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/executeToolCode/useExecuteToolCode';
import { useRestoreToolConversation } from '@shinkai_network/shinkai-node-state/v2/mutations/restoreToolConversation/useRestoreToolConversation';
import { useSaveToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/saveToolCode/useSaveToolCode';
import { useUpdateToolCodeImplementation } from '@shinkai_network/shinkai-node-state/v2/mutations/updateToolCodeImplementation/useUpdateToolCodeImplementation';
import { useGetAllToolAssets } from '@shinkai_network/shinkai-node-state/v2/queries/getAllToolAssets/useGetAllToolAssets';
import { PrismEditor } from 'prism-react-editor';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { useChatConversationWithOptimisticUpdates } from '../../../pages/chat/chat-conversation';
import { useAuth } from '../../../store/auth';
import { useSettings } from '../../../store/settings';
import { ToolMetadataSchema } from '../schemas';
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

const useChatConversation = (initialInboxId?: string) => {
  const [chatInboxId, setChatInboxId] = useState<string | undefined>(
    initialInboxId,
  );

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
    chatInboxId,
    setChatInboxId,
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
  const {
    chatInboxId,
    setChatInboxId,
    conversationData,
    fetchPreviousPage,
    hasPreviousPage,
    isChatConversationLoading,
    isFetchingPreviousPage,
    isChatConversationSuccess,
  } = useChatConversation(initialChatInboxId);

  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();

  const baseToolCodeRef = useRef<string>('');
  const codeEditorRef = useRef<PrismEditor | null>(null);
  const metadataEditorRef = useRef<PrismEditor | null>(null);
  const forceGenerateCode = useRef(false);
  const forceGenerateMetadata = useRef(false);

  const [isDirtyCodeEditor, setIsDirtyCodeEditor] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const [toolResult, setToolResult] = useState<object | null>(null);

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

  const [toolCode, setToolCode] = useState<string>(initialState?.code ?? '');
  const [error, setError] = useState<string | null>(
    initialState?.error ?? null,
  );
  const [toolCodeState, setToolCodeState] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >(initialState?.state ?? 'idle');

  const [xShinkaiAppId] = useState(() => `app-id-${Date.now()}`);
  const [xShinkaiToolId] = useState(() => `task-id-${Date.now()}`);

  const { data: assets } = useGetAllToolAssets({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    xShinkaiAppId,
    xShinkaiToolId,
  });

  useEffect(() => {
    if (initialState?.code) {
      baseToolCodeRef.current = initialState.code;
      forceGenerateCode.current = false;
      setToolCode(initialState.code);
    }
    if (initialState?.state) {
      setToolCodeState(initialState.state);
    }
  }, [initialState?.code, initialState?.state]);

  useEffect(() => {
    const lastMessage = conversationData?.pages?.at(-1)?.at(-1);
    if (!lastMessage || !forceGenerateCode.current) return;

    if (
      lastMessage?.role === 'assistant' &&
      lastMessage?.status.type === 'running'
    ) {
      setToolCodeState('pending');
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
        setToolCodeState('success');
      } else {
        setError('Failed to generate tool code');
        setToolCodeState('error');
      }
    }
  }, [conversationData?.pages, currentLanguage]);

  const isToolCodeGenerationPending = toolCodeState === 'pending';
  const isToolCodeGenerationSuccess = toolCodeState === 'success';
  const isToolCodeGenerationIdle = toolCodeState === 'idle';
  const isToolCodeGenerationError = toolCodeState === 'error';
  const toolCodeGenerationData = toolCode;
  const toolCodeGenerationError = error;

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

  const { mutateAsync: saveToolCode, isPending: isSavingTool } =
    useSaveToolCode({
      onSuccess: (data) => {
        toast.success('Tool code saved successfully');
        navigate(`/tools/${data.metadata.tool_router_key}`);
      },
      onError: (error) => {
        toast.error('Failed to save tool code', {
          position: 'top-right',
          description: error.response?.data?.message ?? error.message,
        });
      },
    });

  const {
    mutateAsync: restoreToolConversation,
    isPending: isRestoringToolConversation,
  } = useRestoreToolConversation({
    onSuccess: () => {
      toast.success('Successfully restore changes');
    },
    onError: (error) => {
      toast.error('Failed to restore tool conversation', {
        position: 'top-right',
        description: error.response?.data?.message ?? error.message,
      });
    },
  });

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

  const handleSaveTool = async () => {
    if (!chatInboxId) return;

    const metadataCode = metadataEditorRef.current?.value;
    const toolCode = codeEditorRef.current?.value;

    let parsedMetadata: ToolMetadata;

    try {
      const parseResult = JSON.parse(metadataCode as string) as ToolMetadata;
      parsedMetadata = ToolMetadataSchema.parse(parseResult);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error('Invalid Metadata JSON Value', {
          description: error.issues.map((issue) => issue.message).join(', '),
        });
        return;
      }

      toast.error('Invalid Metadata JSON', {
        position: 'top-right',
        description: (error as Error)?.message,
      });
      return;
    }

    await saveToolCode({
      code: toolCode,
      metadata: parsedMetadata,
      jobId: extractJobIdFromInbox(chatInboxId),
      token: auth?.api_v2_key ?? '',
      nodeAddress: auth?.node_address ?? '',
      language: currentLanguage,
      assets: assets ?? [],
      xShinkaiAppId,
      xShinkaiToolId,
    });
  };

  const restoreCode = async () => {
    const currentIdx = toolHistory.findIndex(
      (history) => history.code === toolCode,
    );

    await restoreToolConversation({
      token: auth?.api_v2_key ?? '',
      nodeAddress: auth?.node_address ?? '',
      jobId: extractJobIdFromInbox(chatInboxId ?? ''),
      messageId: toolHistory[currentIdx].messageId,
    });
  };

  const goPreviousToolCode = () => {
    const currentIdx = toolHistory.findIndex(
      (history) => history.code === toolCode,
    );
    const prevTool = toolHistory[currentIdx - 1];

    const messageEl = document.getElementById(prevTool.messageId);
    baseToolCodeRef.current = prevTool.code;
    setToolCode(prevTool.code);
    setResetCounter((prev) => prev + 1);
    if (messageEl) {
      // wait til requestAnimationFrame for scrolling
      setTimeout(() => {
        messageEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  };

  const goNextToolCode = () => {
    const currentIdx = toolHistory.findIndex(
      (history) => history.code === toolCode,
    );
    const nextTool = toolHistory[currentIdx + 1];
    baseToolCodeRef.current = nextTool.code;
    setToolCode(nextTool.code);
    setResetCounter((prev) => prev + 1);

    const messageEl = document.getElementById(nextTool.messageId);
    if (messageEl) {
      setTimeout(() => {
        messageEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
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
    chatInboxId,
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
    restoreCode,
    handleCreateToolCode,
    handleApplyChangesCodeSubmit,
    isRestoringToolConversation,
    isSavingTool,
    goPreviousToolCode,
    goNextToolCode,
    handleSaveTool,
    resetToolCode,
    xShinkaiAppId,
    xShinkaiToolId,
  };
};
