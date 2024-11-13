import { zodResolver } from '@hookform/resolvers/zod';
import { StopIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  buildInboxIdFromJobId,
  extractJobIdFromInbox,
  extractReceiverShinkaiName,
  isJobInbox,
} from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import {
  ChatMessageFormSchema,
  chatMessageFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/chat-message';
import {
  CreateJobFormSchema,
  createJobFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/create-job';
import { useSendMessageToInbox } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMesssageToInbox/useSendMessageToInbox';
import {
  VRFolder,
  VRItem,
} from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
import { Models } from '@shinkai_network/shinkai-node-state/lib/utils/models';
import { DEFAULT_CHAT_CONFIG } from '@shinkai_network/shinkai-node-state/v2/constants';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/v2/mutations/sendMessageToJob/useSendMessageToJob';
import { useStopGeneratingLLM } from '@shinkai_network/shinkai-node-state/v2/mutations/stopGeneratingLLM/useStopGeneratingLLM';
import { useGetChatConfig } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConfig/useGetChatConfig';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/useGetChatConversationWithPagination';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import { useGetWorkflowSearch } from '@shinkai_network/shinkai-node-state/v2/queries/getWorkflowSearch/useGetWorkflowSearch';
import {
  Button,
  ChatInputArea,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  fileIconMap,
  FileTypeIcon,
  SendIcon,
  WorkflowPlaygroundIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { getFileExt } from '@shinkai_network/shinkai-ui/helpers';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { useDebounce } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { partial } from 'filesize';
import { AnimatePresence, motion } from 'framer-motion';
import { Paperclip, X, XIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm, useWatch } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useGetCurrentInbox } from '../../hooks/use-current-inbox';
import { allowedFileExtensions } from '../../lib/constants';
import { useAnalytics } from '../../lib/posthog-provider';
import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';
import { usePromptSelectionStore } from '../prompt/context/prompt-selection-context';
import { useWorkflowSelectionStore } from '../workflow/context/workflow-selection-context';
import {
  AIModelSelector,
  AiUpdateSelectionActionBar,
} from './chat-action-bar/ai-update-selection-action-bar';
import {
  chatConfigFormSchema,
  ChatConfigFormSchemaType,
  CreateChatConfigActionBar,
  UpdateChatConfigActionBar,
} from './chat-action-bar/chat-config-action-bar';
import PromptSelectionActionBar from './chat-action-bar/prompt-selection-action-bar';
import WorkflowSelectionActionBar from './chat-action-bar/workflow-selection-action-bar';
import { streamingSupportedModels } from './constants';
import { useSetJobScope } from './context/set-job-scope-context';

export const actionButtonClassnames =
  'shrink-0 bg-gray-350 inline-flex h-[30px] w-[30px] cursor-pointer items-center justify-center gap-1.5 truncate border border-gray-200 px-[7px] py-1.5 text-left text-xs rounded-lg font-normal text-gray-50 hover:bg-gray-300 hover:text-white';
export type ChatConversationLocationState = {
  files: File[];
  agentName: string;
  selectedVRFiles: VRItem[];
  selectedVRFolders: VRFolder[];
};

function ConversationEmptyFooter() {
  const { t } = useTranslation();
  const size = partial({ standard: 'jedec' });
  const navigate = useNavigate();
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);

  const onSelectedKeysChange = useSetJobScope(
    (state) => state.onSelectedKeysChange,
  );

  const selectedFileKeysRef = useSetJobScope(
    (state) => state.selectedFileKeysRef,
  );
  const selectedFolderKeysRef = useSetJobScope(
    (state) => state.selectedFolderKeysRef,
  );
  const promptSelected = usePromptSelectionStore(
    (state) => state.promptSelected,
  );

  const auth = useAuth((state) => state.auth);
  const { captureAnalyticEvent } = useAnalytics();

  const location = useLocation();

  const locationState = location.state as ChatConversationLocationState;

  const defaulAgentId = useSettings((state) => state.defaultAgentId);

  const chatForm = useForm<CreateJobFormSchema>({
    resolver: zodResolver(createJobFormSchema),
    defaultValues: {
      message: '',
      files: [],
    },
  });

  const chatConfigForm = useForm<ChatConfigFormSchemaType>({
    resolver: zodResolver(chatConfigFormSchema),
    defaultValues: {
      stream: DEFAULT_CHAT_CONFIG.stream,
      customPrompt: '',
      temperature: DEFAULT_CHAT_CONFIG.temperature,
      topP: DEFAULT_CHAT_CONFIG.top_p,
      topK: DEFAULT_CHAT_CONFIG.top_k,
    },
  });

  const { llmProviders } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  useEffect(() => {
    if (llmProviders?.length && !defaulAgentId) {
      chatForm.setValue('agent', llmProviders?.[0].id);
    } else {
      chatForm.setValue('agent', defaulAgentId);
    }
  }, [llmProviders, chatForm, defaulAgentId]);

  useEffect(() => {
    if (!locationState?.agentName) {
      return;
    }
    const agent = llmProviders.find(
      (agent) => agent.id === locationState.agentName,
    );
    if (agent) {
      chatForm.setValue('agent', agent.id);
    }
  }, [chatForm, locationState, llmProviders]);

  useEffect(() => {
    if (
      !inboxId &&
      (locationState?.selectedVRFiles?.length > 0 ||
        locationState?.selectedVRFolders?.length > 0)
    ) {
      const selectedVRFilesPathMap = locationState?.selectedVRFiles?.reduce(
        (acc, file) => {
          selectedFileKeysRef.set(file.path, {
            name: file.name,
            path: file.path,
            source: file.vr_header.resource_source,
          });
          acc[file.path] = {
            checked: true,
          };
          return acc;
        },
        {} as Record<string, { checked: boolean }>,
      );

      const selectedVRFoldersPathMap = locationState?.selectedVRFolders?.reduce(
        (acc, folder) => {
          selectedFolderKeysRef.set(folder.path, folder);
          acc[folder.path] = {
            checked: true,
          };
          return acc;
        },
        {} as Record<string, { checked: boolean }>,
      );

      onSelectedKeysChange({
        ...selectedVRFilesPathMap,
        ...selectedVRFoldersPathMap,
      });
    }
  }, [
    inboxId,
    locationState?.selectedVRFiles,
    locationState?.selectedVRFolders,
    selectedFileKeysRef,
    selectedFolderKeysRef,
  ]);

  const workflowSelected = useWorkflowSelectionStore(
    (state) => state.workflowSelected,
  );
  const setWorkflowSelected = useWorkflowSelectionStore(
    (state) => state.setWorkflowSelected,
  );

  const currentMessage = useWatch({
    control: chatForm.control,
    name: 'message',
  });
  const debounceMessage = useDebounce(currentMessage, 500);

  const {
    data: workflowRecommendations,
    isSuccess: isWorkflowRecommendationsSuccess,
  } = useGetWorkflowSearch(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      search: debounceMessage,
    },
    {
      enabled: !!debounceMessage && !!currentMessage,
      select: (data) => data.slice(0, 3),
    },
  );

  const { getRootProps: getRootFileProps, getInputProps: getInputFileProps } =
    useDropzone({
      multiple: true,
      onDrop: (acceptedFiles) => {
        const previousFiles = chatForm.getValues('files') ?? [];
        const newFiles = [...previousFiles, ...acceptedFiles];
        chatForm.setValue('files', newFiles, { shouldValidate: true });
      },
    });

  const currentFiles = useWatch({
    control: chatForm.control,
    name: 'files',
  });
  const { mutateAsync: createJob, isPending } = useCreateJob({
    onError: (error) => {
      toast.error('Failed to send message', {
        description: error.response?.data?.message ?? error.message,
      });
    },
    onSuccess: async (data, variables) => {
      navigate(
        `/inboxes/${encodeURIComponent(buildInboxIdFromJobId(data.jobId))}`,
      );

      const files = variables?.files ?? [];
      const localFilesCount = (variables.selectedVRFiles ?? [])?.length;
      const localFoldersCount = (variables.selectedVRFolders ?? [])?.length;

      if (localFilesCount > 0 || localFoldersCount > 0) {
        captureAnalyticEvent('Ask Local Files', {
          foldersCount: localFoldersCount,
          filesCount: localFilesCount,
        });
      }
      if (files?.length > 0) {
        captureAnalyticEvent('AI Chat with Files', {
          filesCount: files.length,
        });
      } else {
        captureAnalyticEvent('AI Chat', undefined);
      }
    },
  });

  const isWorkflowSelectedAndFilesPresent =
    workflowSelected && currentFiles && currentFiles.length > 0;

  useEffect(() => {
    chatForm.setValue('message', promptSelected?.prompt ?? '');
  }, [chatForm, promptSelected]);

  useEffect(() => {
    chatConfigForm.setValue(
      'stream',
      promptSelected?.isToolNeeded ? false : DEFAULT_CHAT_CONFIG.stream,
    );
  }, [chatConfigForm, chatForm, promptSelected]);

  useEffect(() => {
    if (isWorkflowSelectedAndFilesPresent) {
      chatForm.setValue(
        'message',
        `${formatText(workflowSelected.name)} - ${workflowSelected.description}`,
      );
    }
  }, [chatForm, isWorkflowSelectedAndFilesPresent, workflowSelected]);

  const onSubmit = async (data: CreateJobFormSchema) => {
    if (!auth || data.message.trim() === '') return;
    const selectedVRFiles =
      selectedFileKeysRef.size > 0
        ? Array.from(selectedFileKeysRef.values())
        : [];
    const selectedVRFolders =
      selectedFolderKeysRef.size > 0
        ? Array.from(selectedFolderKeysRef.values())
        : [];

    await createJob({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      llmProvider: data.agent,
      content: data.message,
      files: currentFiles,
      workflowName: workflowSelected?.tool_router_key,
      isHidden: false,
      selectedVRFiles,
      selectedVRFolders,
      chatConfig: {
        stream: chatConfigForm.getValues('stream'),
        custom_prompt: chatConfigForm.getValues('customPrompt') ?? '',
        temperature: chatConfigForm.getValues('temperature'),
        top_p: chatConfigForm.getValues('topP'),
        top_k: chatConfigForm.getValues('topK'),
      },
    });

    chatForm.reset();
    setWorkflowSelected(undefined);
    selectedFileKeysRef.clear();
    selectedFolderKeysRef.clear();
    onSelectedKeysChange(null);
  };

  return (
    <div className="flex flex-col justify-start">
      <div className="relative flex items-start gap-2 p-2 pb-3">
        <Form {...chatForm}>
          <FormField
            control={chatForm.control}
            name="message"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-0">
                <FormLabel className="sr-only">
                  {t('chat.enterMessage')}
                </FormLabel>
                <FormControl>
                  <div className="">
                    <div className="flex items-center justify-between gap-4 px-1 pb-2 pt-1">
                      <div className="flex items-center gap-2.5">
                        <AIModelSelector
                          onValueChange={(value) => {
                            chatForm.setValue('agent', value);
                          }}
                          value={chatForm.watch('agent')}
                        />
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                {...getRootFileProps({
                                  className: cn(
                                    actionButtonClassnames,
                                    'relative shrink-0',
                                  ),
                                })}
                              >
                                <Paperclip className="h-full w-full" />
                                <input
                                  {...chatForm.register('files')}
                                  {...getInputFileProps({
                                    onChange:
                                      chatForm.register('files').onChange,
                                  })}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipPortal>
                              <TooltipContent align="center" side="top">
                                {t('common.uploadFile')} <br />
                                {allowedFileExtensions.join(', ')}
                              </TooltipContent>
                            </TooltipPortal>
                          </Tooltip>
                        </TooltipProvider>
                        <PromptSelectionActionBar />
                        <WorkflowSelectionActionBar />
                      </div>
                      <CreateChatConfigActionBar form={chatConfigForm} />
                    </div>

                    <ChatInputArea
                      autoFocus
                      bottomAddons={
                        <div className="relative z-50 flex items-end gap-3 self-end">
                          {!debounceMessage && (
                            <span className="pb-1 text-xs font-light text-gray-100">
                              <span className="font-medium">Enter</span> to send
                            </span>
                          )}
                          <Button
                            className={cn(
                              'hover:bg-app-gradient h-[40px] w-[40px] cursor-pointer rounded-xl bg-gray-500 p-3 transition-colors',
                              'disabled:text-gray-80 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border disabled:border-gray-200 disabled:bg-gray-300 hover:disabled:bg-gray-300',
                            )}
                            disabled={isPending || !chatForm.watch('message')}
                            onClick={chatForm.handleSubmit(onSubmit)}
                            size="icon"
                            variant="tertiary"
                          >
                            <SendIcon className="h-full w-full" />
                            <span className="sr-only">
                              {t('chat.sendMessage')}
                            </span>
                          </Button>
                        </div>
                      }
                      disabled={isPending || isWorkflowSelectedAndFilesPresent}
                      onChange={field.onChange}
                      onSubmit={chatForm.handleSubmit(onSubmit)}
                      topAddons={
                        <>
                          {workflowSelected && (
                            <div className="relative max-w-full rounded-lg border border-gray-200 p-1.5 px-2">
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2 pr-6">
                                      <WorkflowPlaygroundIcon className="h-3.5 w-3.5" />
                                      <div className="text-gray-80 line-clamp-1 text-xs">
                                        <span className="text-white">
                                          {formatText(workflowSelected.name)}{' '}
                                        </span>
                                        -{' '}
                                        <span className="">
                                          {workflowSelected.description}
                                        </span>
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipPortal>
                                    <TooltipContent
                                      align="end"
                                      alignOffset={-10}
                                      className="max-w-[400px]"
                                      side="top"
                                      sideOffset={10}
                                    >
                                      {workflowSelected.description}
                                    </TooltipContent>
                                  </TooltipPortal>
                                </Tooltip>
                              </TooltipProvider>
                              <button
                                className="absolute right-2 top-1.5 text-gray-100 hover:text-white"
                                onClick={() => {
                                  setWorkflowSelected(undefined);
                                }}
                                type="button"
                              >
                                <XIcon className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                          {currentFiles && currentFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {currentFiles.map((file, index) => (
                                <div
                                  className="relative mt-1 flex min-w-[180px] max-w-[220px] items-center gap-2 self-start rounded-lg border border-gray-200 px-2 py-2.5"
                                  key={index}
                                >
                                  {getFileExt(file.name) &&
                                  fileIconMap[getFileExt(file.name)] ? (
                                    <FileTypeIcon
                                      className="text-gray-80 h-8 w-8 shrink-0"
                                      type={getFileExt(file.name)}
                                    />
                                  ) : (
                                    <Paperclip className="text-gray-80 h-4 w-4 shrink-0" />
                                  )}
                                  <div className="space-y-1">
                                    <span className="line-clamp-1 break-all text-left text-xs">
                                      {file.name}
                                    </span>
                                    <span className="line-clamp-1 break-all text-left text-xs text-gray-100">
                                      {size(file.size)}
                                    </span>
                                  </div>
                                  <button
                                    className={cn(
                                      'absolute -right-2 -top-2 h-5 w-5 cursor-pointer rounded-full bg-gray-500 p-1 text-gray-100 hover:text-white',
                                    )}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      const newFiles = [...currentFiles];
                                      newFiles.splice(index, 1);
                                      chatForm.setValue('files', newFiles, {
                                        shouldValidate: true,
                                      });
                                    }}
                                  >
                                    <X className="h-full w-full" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      }
                      value={field.value}
                    />
                    <motion.div
                      animate={{ opacity: 1 }}
                      className="absolute inset-x-3 bottom-2 flex items-center justify-between gap-2"
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex gap-2">
                        {!!debounceMessage &&
                          !workflowSelected &&
                          isWorkflowRecommendationsSuccess &&
                          workflowRecommendations?.length > 0 &&
                          workflowRecommendations?.map((workflow) => (
                            <motion.button
                              animate={{ opacity: 1, x: 0 }}
                              className={cn(
                                'hover:bg-brand-gradient bg-gray-350 flex items-center gap-2 rounded-lg px-2 py-1 text-xs text-white',
                              )}
                              exit={{ opacity: 0, x: -10 }}
                              initial={{ opacity: 0, x: -10 }}
                              key={workflow.name}
                              onClick={() => {
                                setWorkflowSelected(workflow);
                              }}
                              type="button"
                            >
                              <WorkflowPlaygroundIcon className="h-3 w-3" />
                              {formatText(workflow.name)}
                            </motion.button>
                          ))}
                        {!debounceMessage && (
                          <span className="text-xs font-light text-gray-100">
                            <span className="font-medium">Shift + Enter</span>{' '}
                            for a new line
                          </span>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </Form>
      </div>
    </div>
  );
}

function ConversationChatFooter({ inboxId }: { inboxId: string }) {
  const { t } = useTranslation();
  const size = partial({ standard: 'jedec' });
  const setWorkflowSelected = useWorkflowSelectionStore(
    (state) => state.setWorkflowSelected,
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const auth = useAuth((state) => state.auth);
  const { captureAnalyticEvent } = useAnalytics();

  const chatForm = useForm<ChatMessageFormSchema>({
    resolver: zodResolver(chatMessageFormSchema),
    defaultValues: {
      message: '',
      files: [],
    },
  });

  const promptSelected = usePromptSelectionStore(
    (state) => state.promptSelected,
  );

  const currentInbox = useGetCurrentInbox();
  const { data: chatConfig } = useGetChatConfig(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      jobId: extractJobIdFromInbox(inboxId),
    },
    { enabled: !!inboxId },
  );

  const firstMessageWorkflow = useFirstMessageWorkflow();

  const hasProviderEnableStreaming = streamingSupportedModels.includes(
    currentInbox?.agent?.model.split(':')?.[0] as Models,
  );

  const { data } = useGetChatConversationWithPagination({
    token: auth?.api_v2_key ?? '',
    nodeAddress: auth?.node_address ?? '',
    inboxId: inboxId as string,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    refetchIntervalEnabled:
      !hasProviderEnableStreaming || chatConfig?.stream === false,
  });

  const workflowSelected = useWorkflowSelectionStore(
    (state) => state.workflowSelected,
  );

  const currentMessage = useWatch({
    control: chatForm.control,
    name: 'message',
  });
  const debounceMessage = useDebounce(currentMessage, 500);

  const {
    data: workflowRecommendations,
    isSuccess: isWorkflowRecommendationsSuccess,
  } = useGetWorkflowSearch(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      search: debounceMessage,
    },
    {
      enabled: !!debounceMessage && !!currentMessage,
      select: (data) => data.slice(0, 3),
    },
  );

  const { getRootProps: getRootFileProps, getInputProps: getInputFileProps } =
    useDropzone({
      multiple: true,
      onDrop: (acceptedFiles) => {
        const previousFiles = chatForm.getValues('files') ?? [];
        const newFiles = [...previousFiles, ...acceptedFiles];
        chatForm.setValue('files', newFiles, { shouldValidate: true });
      },
    });

  const currentFiles = useWatch({
    control: chatForm.control,
    name: 'files',
  });

  const { mutateAsync: sendMessageToInbox } = useSendMessageToInbox();
  const { mutateAsync: sendMessageToJob } = useSendMessageToJob({
    onSuccess: (_, variables) => {
      if (variables.files && variables.files.length > 0) {
        captureAnalyticEvent('AI Chat with Files', {
          filesCount: variables.files.length,
        });
      } else {
        captureAnalyticEvent('AI Chat', undefined);
      }
    },
    onError: (error) => {
      toast.error('Failed to send message', {
        description: error.message,
      });
    },
  });

  const isLoadingMessage = useMemo(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    return (
      !!inboxId &&
      lastMessage?.role === 'assistant' &&
      lastMessage?.status.type === 'running'
    );
  }, [data?.pages, inboxId]);

  const isWorkflowSelectedAndFilesPresent =
    workflowSelected && currentFiles && currentFiles.length > 0;

  useEffect(() => {
    if (isWorkflowSelectedAndFilesPresent) {
      chatForm.setValue(
        'message',
        `${formatText(workflowSelected.name)} - ${workflowSelected.description}`,
      );
    }
  }, [chatForm, isWorkflowSelectedAndFilesPresent, workflowSelected]);

  const onSubmit = async (data: ChatMessageFormSchema) => {
    if (!auth || data.message.trim() === '') return;

    let workflowKeyToUse = workflowSelected?.tool_router_key;
    if (!workflowKeyToUse && firstMessageWorkflow) {
      workflowKeyToUse = firstMessageWorkflow.tool_router_key;
    }

    if (isJobInbox(inboxId)) {
      const jobId = extractJobIdFromInbox(inboxId);
      await sendMessageToJob({
        token: auth.api_v2_key,
        nodeAddress: auth.node_address,
        jobId: jobId,
        message: data.message,
        parent: '', // Note: we should set the parent if we want to retry or branch out
        workflowName: workflowKeyToUse,
        files: currentFiles,
      });
    } else {
      const sender = `${auth.shinkai_identity}/${auth.profile}/device/${auth.registration_name}`;
      const receiver = extractReceiverShinkaiName(inboxId, sender);
      await sendMessageToInbox({
        nodeAddress: auth?.node_address ?? '',
        sender: auth.shinkai_identity,
        sender_subidentity: `${auth.profile}/device/${auth.registration_name}`,
        receiver,
        message: data.message,
        inboxId: inboxId,
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
      });
    }
    chatForm.reset();
    setWorkflowSelected(undefined);
  };

  useEffect(() => {
    if (promptSelected) {
      chatForm.setValue('message', promptSelected.prompt);
      setTimeout(() => {
        if (!textareaRef.current) return;
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        textareaRef.current.focus();
      }, 10);
    }
  }, [chatForm, promptSelected]);

  useEffect(() => {
    chatForm.reset();
    setWorkflowSelected(undefined);
  }, [chatForm, inboxId]);

  return (
    <div className="flex flex-col justify-start">
      <div className="relative flex items-start gap-2 p-2 pb-3">
        <StopGeneratingButton
          shouldStopGenerating={hasProviderEnableStreaming && isLoadingMessage}
        />
        <Form {...chatForm}>
          <FormField
            control={chatForm.control}
            name="message"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-0">
                <FormLabel className="sr-only">
                  {t('chat.enterMessage')}
                </FormLabel>
                <FormControl>
                  <div className="">
                    <div className="flex items-center justify-between gap-4 px-1 pb-2 pt-1">
                      <div className="flex items-center gap-2.5">
                        <AiUpdateSelectionActionBar />
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                {...getRootFileProps({
                                  className: cn(
                                    actionButtonClassnames,
                                    'relative shrink-0',
                                  ),
                                })}
                              >
                                <Paperclip className="h-full w-full" />
                                <input
                                  {...chatForm.register('files')}
                                  {...getInputFileProps({
                                    onChange:
                                      chatForm.register('files').onChange,
                                  })}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipPortal>
                              <TooltipContent align="center" side="top">
                                {t('common.uploadFile')}
                                <br />
                                {allowedFileExtensions.join(', ')}
                              </TooltipContent>
                            </TooltipPortal>
                          </Tooltip>
                        </TooltipProvider>
                        <PromptSelectionActionBar />
                        <WorkflowSelectionActionBar />
                      </div>

                      <UpdateChatConfigActionBar />
                    </div>

                    <ChatInputArea
                      autoFocus
                      bottomAddons={
                        <div className="relative z-50 flex items-end gap-3 self-end">
                          {!debounceMessage && (
                            <span className="pb-1 text-xs font-light text-gray-100">
                              <span className="font-medium">Enter</span> to send
                            </span>
                          )}
                          <Button
                            className={cn(
                              'hover:bg-app-gradient h-[40px] w-[40px] cursor-pointer rounded-xl bg-gray-500 p-3 transition-colors',
                              'disabled:text-gray-80 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border disabled:border-gray-200 disabled:bg-gray-300 hover:disabled:bg-gray-300',
                            )}
                            disabled={
                              isLoadingMessage || !chatForm.watch('message')
                            }
                            onClick={chatForm.handleSubmit(onSubmit)}
                            size="icon"
                            variant="tertiary"
                          >
                            <SendIcon className="h-full w-full" />
                            <span className="sr-only">
                              {t('chat.sendMessage')}
                            </span>
                          </Button>
                        </div>
                      }
                      disabled={
                        isLoadingMessage || isWorkflowSelectedAndFilesPresent
                      }
                      onChange={field.onChange}
                      onSubmit={chatForm.handleSubmit(onSubmit)}
                      ref={textareaRef}
                      topAddons={
                        <>
                          {workflowSelected && (
                            <div className="relative max-w-full rounded-lg border border-gray-200 p-1.5 px-2">
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2 pr-6">
                                      <WorkflowPlaygroundIcon className="h-3.5 w-3.5" />
                                      <div className="text-gray-80 line-clamp-1 text-xs">
                                        <span className="text-white">
                                          {formatText(workflowSelected.name)}{' '}
                                        </span>
                                        -{' '}
                                        <span className="">
                                          {workflowSelected.description}
                                        </span>
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipPortal>
                                    <TooltipContent
                                      align="end"
                                      alignOffset={-10}
                                      className="max-w-[400px]"
                                      side="top"
                                      sideOffset={10}
                                    >
                                      {workflowSelected.description}
                                    </TooltipContent>
                                  </TooltipPortal>
                                </Tooltip>
                              </TooltipProvider>
                              <button
                                className="absolute right-2 top-1.5 text-gray-100 hover:text-white"
                                onClick={() => {
                                  setWorkflowSelected(undefined);
                                }}
                                type="button"
                              >
                                <XIcon className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                          {currentFiles && currentFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {currentFiles.map((file, index) => (
                                <div
                                  className="relative mt-1 flex min-w-[180px] max-w-[220px] items-center gap-2 self-start rounded-lg border border-gray-200 px-2 py-2.5"
                                  key={index}
                                >
                                  {getFileExt(file.name) &&
                                  fileIconMap[getFileExt(file.name)] ? (
                                    <FileTypeIcon
                                      className="text-gray-80 h-8 w-8 shrink-0"
                                      type={getFileExt(file.name)}
                                    />
                                  ) : (
                                    <Paperclip className="text-gray-80 h-4 w-4 shrink-0" />
                                  )}
                                  <div className="space-y-1">
                                    <span className="line-clamp-1 break-all text-left text-xs">
                                      {file.name}
                                    </span>
                                    <span className="line-clamp-1 break-all text-left text-xs text-gray-100">
                                      {size(file.size)}
                                    </span>
                                  </div>
                                  <button
                                    className={cn(
                                      'absolute -right-2 -top-2 h-5 w-5 cursor-pointer rounded-full bg-gray-500 p-1 text-gray-100 hover:text-white',
                                    )}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      const newFiles = [...currentFiles];
                                      newFiles.splice(index, 1);
                                      chatForm.setValue('files', newFiles, {
                                        shouldValidate: true,
                                      });
                                    }}
                                  >
                                    <X className="h-full w-full" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      }
                      value={field.value}
                    />
                    <motion.div
                      animate={{ opacity: 1 }}
                      className="absolute inset-x-3 bottom-2 flex items-center justify-between gap-2"
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex gap-2">
                        {!!debounceMessage &&
                          !workflowSelected &&
                          isWorkflowRecommendationsSuccess &&
                          workflowRecommendations?.length > 0 &&
                          workflowRecommendations?.map((workflow) => (
                            <motion.button
                              animate={{ opacity: 1, x: 0 }}
                              className={cn(
                                'hover:bg-brand-gradient bg-gray-350 flex items-center gap-2 rounded-lg px-2 py-1 text-xs text-white',
                              )}
                              exit={{ opacity: 0, x: -10 }}
                              initial={{ opacity: 0, x: -10 }}
                              key={workflow.name}
                              onClick={() => {
                                setWorkflowSelected(workflow);
                              }}
                              type="button"
                            >
                              <WorkflowPlaygroundIcon className="h-3 w-3" />
                              {formatText(workflow.name)}
                            </motion.button>
                          ))}
                        {!debounceMessage && (
                          <span className="text-xs font-light text-gray-100">
                            <span className="font-medium">Shift + Enter</span>{' '}
                            for a new line
                          </span>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </Form>
      </div>
    </div>
  );
}
export default function ConversationFooter() {
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);
  if (!inboxId) {
    return <ConversationEmptyFooter />;
  }
  return <ConversationChatFooter inboxId={inboxId} />;
}

function StopGeneratingButton({
  shouldStopGenerating,
}: {
  shouldStopGenerating: boolean;
}) {
  const auth = useAuth((state) => state.auth);
  const { mutateAsync: stopGenerating } = useStopGeneratingLLM();
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);

  const onStopGenerating = async () => {
    if (!inboxId) return;
    const decodedInboxId = decodeURIComponent(inboxId);
    const jobId = extractJobIdFromInbox(decodedInboxId);
    await stopGenerating({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      jobId: jobId,
    });
  };

  return (
    <AnimatePresence>
      {shouldStopGenerating && !!inboxId && (
        <motion.button
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-350 absolute -top-6 left-[calc(50%-40px)] flex items-center justify-center gap-3 rounded-lg border px-2 py-1.5 text-xs text-white transition-colors hover:bg-gray-300"
          exit={{ opacity: 0, y: 10 }}
          initial={{ opacity: 0, y: 10 }}
          onClick={onStopGenerating}
          transition={{ duration: 0.2 }}
        >
          <StopIcon className="h-4 w-4" />
          Stop generating
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function useFirstMessageWorkflow() {
  const auth = useAuth((state) => state.auth);
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);
  const { data } = useGetChatConversationWithPagination({
    token: auth?.api_v2_key ?? '',
    nodeAddress: auth?.node_address ?? '',
    inboxId: inboxId as string,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
  });

  const [firstMessageWorkflow, setFirstMessageWorkflow] = useState<{
    name: string;
    author: string;
    tool_router_key: string;
  } | null>(null);

  useEffect(() => {
    if (data?.pages && data.pages.length > 0 && data.pages[0].length > 0) {
      const firstMessage = data.pages[0][0];
      if (firstMessage.role === 'user' && firstMessage.workflowName) {
        const [name, author] = firstMessage.workflowName.split(':::');
        setFirstMessageWorkflow({
          name,
          author,
          tool_router_key: firstMessage.workflowName,
        });
      }
    }
  }, [data?.pages]);

  return firstMessageWorkflow;
}
