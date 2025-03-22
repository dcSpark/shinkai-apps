import { FormProps } from '@rjsf/core';
import { ToolMetadata } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import {
  buildInboxIdFromJobId,
  extractJobIdFromInbox,
} from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useCreateToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolCode/useCreateToolCode';
import { useCreateToolMetadata } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolMetadata/useCreateToolMetadata';
import { useExecuteToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/executeToolCode/useExecuteToolCode';
import { useUpdateToolCodeImplementation } from '@shinkai_network/shinkai-node-state/v2/mutations/updateToolCodeImplementation/useUpdateToolCodeImplementation';
import { PrismEditor } from 'prism-react-editor';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import { useChatConversationWithOptimisticUpdates } from '../../../pages/chat/chat-conversation';
import { useAuth } from '../../../store/auth';
import { useWebSocketMessage } from '../../chat/websocket-message';
import {
  ToolCreationState,
  usePlaygroundStore,
} from '../context/playground-context';
import { ToolMetadataSchema, ToolMetadataSchemaType } from '../schemas';
import {
  extractCodeByLanguage,
  extractCodeLanguage,
  parseJsonFromCodeBlock,
  validateCodeSnippet,
} from '../utils/code';
import { CreateToolCodeFormSchema } from './use-tool-code';
import { useToolSave } from './use-tool-save';

export type ToolCreationStepStatus = 'idle' | 'pending' | 'success' | 'error';

export interface ToolFlowOptions {
  form: UseFormReturn<CreateToolCodeFormSchema>;
  initialInboxId?: string;
  initialState?: {
    code?: string;
    metadata?: ToolMetadata | null;
    codeState?: ToolCreationStepStatus;
    metadataState?: ToolCreationStepStatus;
    error?: string | null;
  };
  requireFeedbackFlow?: boolean;
  isPlaygroundMode?: boolean;
  tools?: string[];
}

export const useToolFlow = ({
  form,
  initialInboxId,
  initialState,
  requireFeedbackFlow = false,
  isPlaygroundMode = false,
  tools,
}: ToolFlowOptions) => {
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();

  const currentStep = usePlaygroundStore((state) => state.currentStep);
  const setCurrentStep = usePlaygroundStore((state) => state.setCurrentStep);
  const toolCreationError = usePlaygroundStore(
    (state) => state.toolCreationError,
  );

  const setToolCreationError = usePlaygroundStore(
    (state) => state.setToolCreationError,
  );

  const location = useLocation();
  const isFeedbackPage = location.pathname.includes('/tool-feedback');

  const forceGenerateCode = usePlaygroundStore(
    (state) => state.forceGenerateCode,
  );
  const forceGenerateMetadata = usePlaygroundStore(
    (state) => state.forceGenerateMetadata,
  );
  const forceAutoSave = usePlaygroundStore((state) => state.forceAutoSave);

  const baseToolCodeRef = useRef<string>(initialState?.code || '');
  const codeEditorRef = useRef<PrismEditor | null>(null);
  const metadataEditorRef = useRef<PrismEditor | null>(null);

  const [isDirtyCodeEditor, setIsDirtyCodeEditor] = useState(false);
  const resetCounter = usePlaygroundStore((state) => state.resetCounter);
  const setResetCounter = usePlaygroundStore((state) => state.setResetCounter);

  const chatInboxId = usePlaygroundStore((state) => state.chatInboxId);
  const setChatInboxId = usePlaygroundStore((state) => state.setChatInboxId);
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

  const xShinkaiAppId = usePlaygroundStore((state) => state.xShinkaiAppId);
  const xShinkaiToolId = usePlaygroundStore((state) => state.xShinkaiToolId);

  const mountTimestamp = useRef(new Date());

  useEffect(() => {
    if (initialState?.code) {
      baseToolCodeRef.current = initialState.code;
      setToolCode(initialState.code);
    }
    if (initialState?.codeState) {
      setToolCodeStatus(initialState.codeState);
    }
    if (initialState?.metadata) {
      setToolMetadata(initialState.metadata);
    }
    if (initialState?.metadataState) {
      setToolMetadataStatus(initialState.metadataState);
    }
  }, [
    initialState,
    setToolCode,
    setToolCodeStatus,
    setToolMetadata,
    setToolMetadataStatus,
  ]);

  useEffect(() => {
    if (initialInboxId) {
      setChatInboxId(initialInboxId);
    }
  }, [initialInboxId, setChatInboxId]);

  const {
    data: conversationData,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    isChatConversationLoading,
    isChatConversationSuccess,
  } = useChatConversationWithOptimisticUpdates({
    inboxId: chatInboxId ?? '',
  });

  useWebSocketMessage({ inboxId: chatInboxId ?? '', enabled: !!chatInboxId });

  const formattedConversationData = useMemo(() => {
    if (!conversationData) return;
    return {
      ...conversationData,
      pages: conversationData.pages?.map((page) =>
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
  }, [conversationData]);

  const [metadataInboxId, setMetadataInboxId] = useState<string | undefined>(
    undefined,
  );
  const { data: metadataConversation } =
    useChatConversationWithOptimisticUpdates({
      inboxId: metadataInboxId ?? '',
      forceRefetchInterval: true,
    });

  // useWebSocketMessage({
  //   inboxId: metadataInboxId ?? '',
  //   enabled: !!metadataInboxId,
  // });

  const toolHistory = useMemo(() => {
    const messageList = formattedConversationData?.pages.flat() ?? [];
    const currentLanguage = form.watch('language');

    const toolCodesFound = messageList
      .map((message) => {
        const language = extractCodeLanguage(message.content);
        if (
          message.role === 'assistant' &&
          message.status.type === 'complete' &&
          validateCodeSnippet(
            extractCodeByLanguage(
              message.content,
              language ?? currentLanguage,
            ) ?? '',
            currentLanguage,
          )
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
  }, [formattedConversationData?.pages, form]);

  const { mutateAsync: createToolCode, isPending: isCreatingToolCode } =
    useCreateToolCode({
      onSuccess: (data) => {
        setChatInboxId(data.inbox);
        setToolCode('');
        forceGenerateCode.current = true;
        baseToolCodeRef.current = '';
        setToolResult(null);
        executeToolCodeQuery.reset();

        if (isFeedbackPage) {
          setCurrentStep(ToolCreationState.PLAN_REVIEW);
        } else if (requireFeedbackFlow) {
          navigate(`/tools/tool-feedback/${data.inbox}`);
          setCurrentStep(ToolCreationState.PLAN_REVIEW);
        } else {
          setCurrentStep(ToolCreationState.CREATING_CODE);
        }
      },
      onError: (error) => {
        setToolCreationError(`Failed to create tool code: ${error.message}`);
      },
    });

  const { mutateAsync: createToolMetadata, isPending: isCreatingMetadata } =
    useCreateToolMetadata({
      onSuccess: (data) => {
        setMetadataInboxId(buildInboxIdFromJobId(data.job_id));
      },
      onError: (error) => {
        setToolCreationError(
          `Failed to create tool metadata: ${error.message}`,
        );
      },
    });

  const { mutateAsync: updateToolCodeImplementation } =
    useUpdateToolCodeImplementation();

  const executeToolCodeQuery = useExecuteToolCode({
    onSuccess: (data) => {
      setToolResult(data);
    },
  });

  const { handleSaveTool, isSavingTool } = useToolSave();
  console.count('component mounted');

  useEffect(() => {
    const lastMessage = formattedConversationData?.pages?.at(-1)?.at(-1);
    if (!lastMessage || !forceGenerateCode.current) return;

    const isRunning =
      lastMessage.role === 'assistant' && lastMessage.status.type === 'running';

    if (isRunning) {
      setToolCodeStatus((prevStatus) =>
        prevStatus !== 'pending' ? 'pending' : prevStatus,
      );
      return;
    }

    if (
      lastMessage.role === 'assistant' &&
      lastMessage.status.type === 'complete'
    ) {
      const language = extractCodeLanguage(lastMessage.content);
      const currentLanguage = form.watch('language');

      const generatedCode = extractCodeByLanguage(
        lastMessage.content,
        language ?? currentLanguage,
      );

      if (
        generatedCode &&
        validateCodeSnippet(generatedCode, currentLanguage)
      ) {
        baseToolCodeRef.current = generatedCode;
        setToolCode(generatedCode);
        setToolCodeStatus('success');
        if (!isPlaygroundMode) {
          setCurrentStep(ToolCreationState.CREATING_METADATA);
        }
        if (isFeedbackPage || !isPlaygroundMode) {
          forceGenerateMetadata.current = true;
        }
      } else {
        setToolCodeError('Failed to extract code from response');
        setToolCodeStatus('error');
      }
    }
  }, [
    formattedConversationData?.pages,
    form,
    setToolCode,
    setToolCodeError,
    forceGenerateCode,
    isPlaygroundMode,
    isFeedbackPage,
    forceGenerateMetadata,
    setToolCodeStatus,
  ]);
  console.log(currentStep, 'currentStep');

  useEffect(() => {
    const lastMessage = metadataConversation?.pages?.at(-1)?.at(-1);
    if (!lastMessage) return;

    if (
      lastMessage.role === 'assistant' &&
      lastMessage.status.type === 'running'
    ) {
      if (toolMetadataStatus === 'pending') return;
      setToolMetadataStatus('pending');

      return;
    }

    if (
      lastMessage.role === 'assistant' &&
      lastMessage.status.type === 'complete'
    ) {
      const extractedMetadata = parseJsonFromCodeBlock(lastMessage.content);

      if (extractedMetadata) {
        try {
          const parsedMetadata = ToolMetadataSchema.parse(
            extractedMetadata,
          ) as ToolMetadataSchemaType;
          setToolMetadata(parsedMetadata as ToolMetadata);
          setToolMetadataStatus('success');
          setToolMetadataError(null);
          if (!isPlaygroundMode) {
            setCurrentStep(ToolCreationState.SAVING_TOOL);
            forceAutoSave.current = true;
          }
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

        if (!isPlaygroundMode) {
          setToolCreationError('Failed to extract metadata from response');
        }
      }
    }
  }, [
    metadataConversation?.pages,
    setToolMetadata,
    setToolMetadataStatus,
    setToolMetadataError,
    isPlaygroundMode,
    toolMetadataStatus,
  ]);

  useEffect(() => {
    if (!toolCode || !forceGenerateMetadata.current || !chatInboxId) return;

    const generateMetadata = async () => {
      const currentTools = tools || form.watch('tools');

      await createToolMetadata({
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        jobId: extractJobIdFromInbox(chatInboxId),
        tools: currentTools,
      });
    };

    generateMetadata();
  }, [
    toolCode,
    forceGenerateMetadata,
    chatInboxId,
    auth?.node_address,
    auth?.api_v2_key,
    createToolMetadata,
    form,
    tools,
    setCurrentStep,
  ]);

  const startToolCreation = async (data: CreateToolCodeFormSchema) => {
    if (!auth) return;
    setToolCreationError(null);

    if (requireFeedbackFlow) setCurrentStep(ToolCreationState.PLAN_REVIEW);
    else setCurrentStep(ToolCreationState.CREATING_CODE);

    await createToolCode({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      message: data.message,
      llmProviderId: data.llmProviderId,
      jobId: chatInboxId ? extractJobIdFromInbox(chatInboxId) : undefined,
      tools: data.tools,
      language: data.language,
    });

    form.setValue('message', '');
  };

  const handleContinueConversation = async (message: string) => {
    if (!chatInboxId || !auth) return;

    await createToolCode({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      message,
      llmProviderId: form.watch('llmProviderId'),
      jobId: extractJobIdFromInbox(chatInboxId),
      tools: form.watch('tools'),
      language: form.watch('language'),
    });

    form.setValue('message', '');
  };

  const generateMetadata = async () => {
    setToolMetadataStatus('pending');
    forceGenerateMetadata.current = true;

    // const currentTools = tools || form.watch('tools');

    // await createToolMetadata({
    //   nodeAddress: auth.node_address,
    //   token: auth.api_v2_key,
    //   jobId: extractJobIdFromInbox(chatInboxId),
    //   tools: currentTools,
    // });
  };

  useEffect(() => {
    if (
      !isPlaygroundMode &&
      toolCode &&
      toolMetadata &&
      toolCodeStatus === 'success' &&
      toolMetadataStatus === 'success' &&
      forceAutoSave.current
    ) {
      handleSaveTool({
        toolMetadata: toolMetadata,
        toolCode: toolCode,
        tools: form.getValues('tools'),
        language: form.getValues('language'),
        shouldPrefetchPlaygroundTool: true,
        onSuccess: () => {
          forceAutoSave.current = false;
          setCurrentStep(ToolCreationState.COMPLETED);
        },
      });
    }
  }, [
    toolCode,
    toolMetadata,
    toolCodeStatus,
    toolMetadataStatus,
    currentStep,
    isPlaygroundMode,
    handleSaveTool,
    form,
    setCurrentStep,
    forceAutoSave,
  ]);

  const handleApplyChangesCodeSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!chatInboxId || !auth) return;

      const data = new FormData(e.currentTarget);
      const currentEditorValue = data.get('editor');
      setResetCounter((prev) => prev + 1);
      setIsDirtyCodeEditor(false);
      baseToolCodeRef.current = currentEditorValue as string;

      await updateToolCodeImplementation({
        token: auth.api_v2_key,
        nodeAddress: auth.node_address,
        jobId: extractJobIdFromInbox(chatInboxId),
        code: currentEditorValue as string,
      });

      setTimeout(() => {
        setToolCode(currentEditorValue as string);
      }, 100);
    },
    [
      chatInboxId,
      auth,
      setResetCounter,
      setIsDirtyCodeEditor,
      updateToolCodeImplementation,
      setToolCode,
    ],
  );

  const resetToolCode = useCallback(() => {
    setIsDirtyCodeEditor(false);
    setResetCounter((prev) => prev + 1);
    forceGenerateMetadata.current = true;
    setTimeout(() => {
      setToolCode(baseToolCodeRef.current);
    }, 0);
  }, [setIsDirtyCodeEditor, setResetCounter, setToolCode]);

  const executeToolCode: FormProps['onSubmit'] = useCallback(
    async (data: any) => {
      if (!auth) return;
      mountTimestamp.current = new Date();
      const { configs, params } = data.formData;

      const currentCode = codeEditorRef?.current?.value ?? toolCode ?? '';

      await executeToolCodeQuery.mutateAsync({
        code: currentCode,
        nodeAddress: auth.node_address,
        token: auth.api_v2_key,
        params,
        llmProviderId: form.getValues('llmProviderId'),
        tools: form.getValues('tools'),
        language: form.getValues('language'),
        configs,
        xShinkaiAppId,
        xShinkaiToolId,
      });
    },
    [executeToolCodeQuery, form, auth, toolCode, xShinkaiAppId, xShinkaiToolId],
  );

  const { __created_files__: toolResultFiles, ...toolResultWithoutFiles } =
    (toolResult || {
      __created_files__: [],
    }) as {
      __created_files__: string[];
      [key: string]: any;
    };

  return {
    currentStep,
    error: toolCreationError,
    // isProcessing,

    mountTimestamp,

    toolCode,
    toolCodeStatus,
    toolCodeError,
    baseToolCodeRef,

    toolMetadata,
    toolMetadataStatus,
    toolMetadataError,

    isDirtyCodeEditor,
    setIsDirtyCodeEditor,
    resetCounter,
    codeEditorRef,
    metadataEditorRef,

    chatConversationData: formattedConversationData,
    fetchPreviousPage,
    hasPreviousPage,
    isChatConversationLoading,
    isFetchingPreviousPage,
    isChatConversationSuccess,
    toolHistory,

    executeToolCode,
    executeToolCodeQuery,
    toolResult: toolResultWithoutFiles,
    toolResultFiles,

    isCreatingToolCode,
    isCreatingMetadata,
    isSavingTool,

    startToolCreation,
    generateMetadata,
    handleContinueConversation,
    handleApplyChangesCodeSubmit,
    resetToolCode,
    forceGenerateMetadata,
  };
};
