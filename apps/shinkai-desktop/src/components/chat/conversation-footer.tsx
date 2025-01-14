import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircledIcon, StopIcon } from '@radix-ui/react-icons';
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
import { Models } from '@shinkai_network/shinkai-node-state/lib/utils/models';
import { DEFAULT_CHAT_CONFIG } from '@shinkai_network/shinkai-node-state/v2/constants';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/v2/mutations/sendMessageToJob/useSendMessageToJob';
import { useStopGeneratingLLM } from '@shinkai_network/shinkai-node-state/v2/mutations/stopGeneratingLLM/useStopGeneratingLLM';
import { useGetChatConfig } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConfig/useGetChatConfig';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/useGetChatConversationWithPagination';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import { useGetSearchTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsSearch/useGetToolsSearch';
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
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  fileIconMap,
  FileTypeIcon,
  SendIcon,
  ToolsIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { formatText, getFileExt } from '@shinkai_network/shinkai-ui/helpers';
import { useDebounce } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { partial } from 'filesize';
import { AnimatePresence, motion } from 'framer-motion';
import { Paperclip, X, XIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm, useWatch } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useGetCurrentInbox } from '../../hooks/use-current-inbox';
import { useAnalytics } from '../../lib/posthog-provider';
import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';
import { usePromptSelectionStore } from '../prompt/context/prompt-selection-context';
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
import { FileSelectionActionBar } from './chat-action-bar/file-selection-action-bar';
import PromptSelectionActionBar from './chat-action-bar/prompt-selection-action-bar';
import {
  ToolsSwitchActionBar,
  UpdateToolsSwitchActionBar,
} from './chat-action-bar/tools-switch-action-bar';
import { streamingSupportedModels } from './constants';
import { useSetJobScope } from './context/set-job-scope-context';

export const actionButtonClassnames =
  'shrink-0 bg-gray-350 inline-flex h-[30px] w-[30px] cursor-pointer items-center justify-center gap-1.5 truncate border border-gray-200 px-[7px] py-1.5 text-left text-xs rounded-lg font-normal text-gray-50 hover:bg-gray-300 hover:text-white';

export type ChatConversationLocationState = {
  files: File[];
  agentName: string;
  selectedVRFiles: string[];
  selectedVRFolders: string[];
  llmProviderId: string;
};

function ConversationEmptyFooter() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
  const isAgentInbox = locationState?.agentName;
  const defaulAgentId = useSettings((state) => state.defaultAgentId);

  const chatForm = useForm<CreateJobFormSchema>({
    resolver: zodResolver(createJobFormSchema),
    defaultValues: {
      message: '',
      files: [],
    },
  });
  const selectedTool = chatForm.watch('tool');

  const chatConfigForm = useForm<ChatConfigFormSchemaType>({
    resolver: zodResolver(chatConfigFormSchema),
    defaultValues: {
      stream: DEFAULT_CHAT_CONFIG.stream,
      customPrompt: '',
      temperature: DEFAULT_CHAT_CONFIG.temperature,
      topP: DEFAULT_CHAT_CONFIG.top_p,
      topK: DEFAULT_CHAT_CONFIG.top_k,
      useTools: DEFAULT_CHAT_CONFIG.use_tools,
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
    if (!locationState?.llmProviderId) {
      return;
    }
    const llmProvider = llmProviders.find(
      (agent) => agent.id === locationState.llmProviderId,
    );
    if (llmProvider) {
      chatForm.setValue('agent', llmProvider.id);
    }
  }, [chatForm, locationState, llmProviders]);

  useEffect(() => {
    if (!locationState?.agentName) {
      return;
    }
    chatForm.setValue('agent', locationState.agentName);
  }, [chatForm, locationState, llmProviders]);

  useEffect(() => {
    if (
      !inboxId &&
      (locationState?.selectedVRFiles?.length > 0 ||
        locationState?.selectedVRFolders?.length > 0)
    ) {
      const selectedVRFilesPathMap = locationState?.selectedVRFiles?.reduce(
        (acc, path) => {
          selectedFileKeysRef.set(path, path);
          acc[path] = {
            checked: true,
          };
          return acc;
        },
        {} as Record<string, { checked: boolean }>,
      );

      const selectedVRFoldersPathMap = locationState?.selectedVRFolders?.reduce(
        (acc, path) => {
          selectedFolderKeysRef.set(path, path);
          acc[path] = {
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
    onSelectedKeysChange,
  ]);

  const currentMessage = useWatch({
    control: chatForm.control,
    name: 'message',
  });
  const debounceMessage = useDebounce(currentMessage, 500);

  const { data: searchToolList, isSuccess: isSearchToolListSuccess } =
    useGetSearchTools(
      {
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        search: debounceMessage,
      },
      {
        enabled: !!debounceMessage && !!currentMessage && !selectedTool,
        select: (data) => data.slice(0, 3),
      },
    );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const previousFiles = chatForm.getValues('files') ?? [];
      const newFiles = [...previousFiles, ...acceptedFiles];
      chatForm.setValue('files', newFiles, { shouldValidate: true });
    },
    [chatForm],
  );

  const {
    getRootProps: getRootFileProps,
    getInputProps: getInputFileProps,
    isDragActive,
    open: openFilePicker,
  } = useDropzone({
    noClick: true,
    noKeyboard: true,
    multiple: true,
    onDrop,
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

  useEffect(() => {
    chatForm.setValue('message', promptSelected?.prompt ?? '');
  }, [chatForm, promptSelected]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    textareaRef.current.focus();
  }, [chatForm.watch('message')]);

  useEffect(() => {
    chatConfigForm.setValue(
      'useTools',
      promptSelected?.useTools ? true : DEFAULT_CHAT_CONFIG.use_tools,
    );
  }, [chatConfigForm, chatForm, promptSelected]);

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
      isHidden: false,
      toolKey: data.tool?.key,
      selectedVRFiles,
      selectedVRFolders,
      ...(!isAgentInbox && {
        chatConfig: {
          stream: chatConfigForm.getValues('stream'),
          custom_prompt: chatConfigForm.getValues('customPrompt') ?? '',
          temperature: chatConfigForm.getValues('temperature'),
          top_p: chatConfigForm.getValues('topP'),
          top_k: chatConfigForm.getValues('topK'),
          use_tools: chatConfigForm.getValues('useTools'),
        },
      }),
    });

    chatForm.reset();
    selectedFileKeysRef.clear();
    selectedFolderKeysRef.clear();
    onSelectedKeysChange(null);
  };

  return (
    <div
      {...getRootFileProps({
        className: 'relative flex flex-col content-align p-2 pb-3',
      })}
    >
      <Form {...chatForm}>
        <FormField
          control={chatForm.control}
          name="message"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="sr-only">
                {t('chat.enterMessage')}
              </FormLabel>
              <FormControl>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-4 px-1 pb-2 pt-1">
                    <div className="flex items-center gap-2.5">
                      <AIModelSelector
                        onValueChange={(value) => {
                          chatForm.setValue('agent', value);
                        }}
                        value={chatForm.watch('agent')}
                      />
                      <FileSelectionActionBar
                        inputProps={{
                          ...chatForm.register('files'),
                          ...getInputFileProps(),
                        }}
                        onClick={openFilePicker}
                      />
                      <PromptSelectionActionBar />
                      {!isAgentInbox && (
                        <ToolsSwitchActionBar
                          checked={chatConfigForm.watch('useTools')}
                          onCheckedChange={(checked) => {
                            chatConfigForm.setValue('useTools', checked);
                          }}
                        />
                      )}
                    </div>
                    {!isAgentInbox && (
                      <CreateChatConfigActionBar form={chatConfigForm} />
                    )}
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
                    disabled={isPending}
                    onChange={field.onChange}
                    onKeyDown={(e) => {
                      if (
                        (e.ctrlKey || e.metaKey) &&
                        e.key === 'z' &&
                        promptSelected?.prompt === chatForm.watch('message')
                      ) {
                        chatForm.setValue('message', '');
                      }
                    }}
                    onPaste={(event) => {
                      const items = event.clipboardData?.items;
                      if (items) {
                        for (let i = 0; i < items.length; i++) {
                          if (items[i].type.indexOf('image') !== -1) {
                            const file = items[i].getAsFile();
                            if (file) {
                              onDrop([file]);
                            }
                          }
                        }
                      }
                    }}
                    onSubmit={chatForm.handleSubmit(onSubmit)}
                    ref={textareaRef}
                    topAddons={
                      <>
                        {isDragActive && <DropFileActive />}
                        {selectedTool && (
                          <SelectedToolChat
                            args={selectedTool.args ?? []}
                            description={selectedTool.description}
                            name={formatText(selectedTool.name)}
                            remove={() => {
                              chatForm.setValue('tool', undefined);
                            }}
                          />
                        )}
                        {!isDragActive &&
                          currentFiles &&
                          currentFiles.length > 0 && (
                            <FileList
                              currentFiles={currentFiles}
                              onRemoveFile={(index) => {
                                const newFiles = [...currentFiles];
                                newFiles.splice(index, 1);
                                chatForm.setValue('files', newFiles, {
                                  shouldValidate: true,
                                });
                              }}
                            />
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
                        !selectedTool &&
                        isSearchToolListSuccess &&
                        searchToolList?.length > 0 &&
                        searchToolList?.map((tool) => (
                          <Tooltip key={tool.tool_router_key}>
                            <TooltipTrigger asChild>
                              <motion.button
                                animate={{ opacity: 1, x: 0 }}
                                className={cn(
                                  'bg-gray-375 hover:bg-gray-450 flex items-center gap-2 rounded-lg px-2 py-1 text-xs text-white transition-colors',
                                )}
                                exit={{ opacity: 0, x: -10 }}
                                initial={{ opacity: 0, x: -10 }}
                                key={tool.tool_router_key}
                                onClick={() => {
                                  chatForm.setValue('tool', {
                                    key: tool.tool_router_key,
                                    name: tool.name,
                                    description: tool.description,
                                    args: Object.keys(
                                      tool.input_args.properties ?? {},
                                    ),
                                  });
                                  chatConfigForm.setValue('useTools', true);
                                }}
                                type="button"
                              >
                                <ToolsIcon className="h-3 w-3" />
                                {formatText(tool.name)}
                              </motion.button>
                            </TooltipTrigger>
                            <TooltipPortal>
                              <TooltipContent
                                align="start"
                                className="max-w-[500px]"
                                side="top"
                              >
                                {tool.description}
                              </TooltipContent>
                            </TooltipPortal>
                          </Tooltip>
                        ))}
                      {!debounceMessage && (
                        <span className="text-xs font-light text-gray-100">
                          <span className="font-medium">Shift + Enter</span> for
                          a new line
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
  );
}
function ConversationChatFooter({ inboxId }: { inboxId: string }) {
  const { t } = useTranslation();

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

  const { data: chatConfig } = useGetChatConfig(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      jobId: extractJobIdFromInbox(inboxId),
    },
    { enabled: !!inboxId },
  );

  const chatConfigForm = useForm<ChatConfigFormSchemaType>({
    resolver: zodResolver(chatConfigFormSchema),
    defaultValues: {
      stream: chatConfig?.stream ?? DEFAULT_CHAT_CONFIG.stream,
      customPrompt: chatConfig?.custom_prompt ?? '',
      temperature: chatConfig?.temperature ?? DEFAULT_CHAT_CONFIG.temperature,
      topP: chatConfig?.top_p ?? DEFAULT_CHAT_CONFIG.top_p,
      topK: chatConfig?.top_k ?? DEFAULT_CHAT_CONFIG.top_k,
      useTools: chatConfig?.use_tools ?? DEFAULT_CHAT_CONFIG.use_tools,
    },
  });

  useEffect(() => {
    if (chatConfig) {
      chatConfigForm.reset({
        stream: chatConfig.stream,
        customPrompt: chatConfig.custom_prompt ?? '',
        temperature: chatConfig.temperature,
        topP: chatConfig.top_p,
        topK: chatConfig.top_k,
        useTools: chatConfig.use_tools,
      });
    }
  }, [chatConfig, chatConfigForm]);

  const selectedTool = chatForm.watch('tool');

  const promptSelected = usePromptSelectionStore(
    (state) => state.promptSelected,
  );

  const currentInbox = useGetCurrentInbox();
  const isAgentInbox = currentInbox?.agent?.type === 'Agent';

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

  const currentMessage = useWatch({
    control: chatForm.control,
    name: 'message',
  });
  const debounceMessage = useDebounce(currentMessage, 500);

  const { data: searchToolList, isSuccess: isSearchToolListSuccess } =
    useGetSearchTools(
      {
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        search: debounceMessage,
      },
      {
        enabled: !!debounceMessage && !!currentMessage && !selectedTool,
        select: (data) => data.slice(0, 3),
      },
    );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const previousFiles = chatForm.getValues('files') ?? [];
      const newFiles = [...previousFiles, ...acceptedFiles];
      chatForm.setValue('files', newFiles, { shouldValidate: true });
    },
    [chatForm],
  );

  const {
    getRootProps: getRootFileProps,
    getInputProps: getInputFileProps,
    isDragActive,
    open: openFilePicker,
  } = useDropzone({
    noClick: true,
    noKeyboard: true,
    multiple: true,
    onDrop,
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

  const onSubmit = async (data: ChatMessageFormSchema) => {
    if (!auth || data.message.trim() === '') return;

    if (isJobInbox(inboxId)) {
      const jobId = extractJobIdFromInbox(inboxId);
      await sendMessageToJob({
        token: auth.api_v2_key,
        nodeAddress: auth.node_address,
        jobId: jobId,
        message: data.message,
        parent: '', // Note: we should set the parent if we want to retry or branch out
        files: currentFiles,
        toolKey: selectedTool?.key,
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
  };

  useEffect(() => {
    if (promptSelected) {
      chatForm.setValue('message', promptSelected.prompt);
    }
  }, [chatForm, promptSelected]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    textareaRef.current.focus();
  }, [chatForm.watch('message')]);

  useEffect(() => {
    chatForm.reset();
  }, [chatForm, inboxId]);

  return (
    <div
      {...getRootFileProps({
        className: 'relative shrink-0 p-2 pb-3',
      })}
    >
      <StopGeneratingButton
        shouldStopGenerating={hasProviderEnableStreaming && isLoadingMessage}
      />
      <Form {...chatForm}>
        <FormField
          control={chatForm.control}
          name="message"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="sr-only">
                {t('chat.enterMessage')}
              </FormLabel>
              <FormControl>
                <div className="">
                  <div className="flex items-center justify-between gap-4 px-1 pb-2 pt-1">
                    <div className="flex items-center gap-2.5">
                      <AiUpdateSelectionActionBar />
                      <FileSelectionActionBar
                        inputProps={{
                          ...chatForm.register('files'),
                          ...getInputFileProps(),
                        }}
                        onClick={openFilePicker}
                      />
                      <PromptSelectionActionBar />
                      <UpdateToolsSwitchActionBar />
                    </div>

                    {!isAgentInbox && <UpdateChatConfigActionBar />}
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
                    disabled={isLoadingMessage}
                    onChange={field.onChange}
                    onKeyDown={(e) => {
                      if (
                        (e.ctrlKey || e.metaKey) &&
                        e.key === 'z' &&
                        promptSelected?.prompt === chatForm.watch('message')
                      ) {
                        chatForm.setValue('message', '');
                      }
                    }}
                    onPaste={(event) => {
                      const items = event.clipboardData?.items;
                      if (items) {
                        for (let i = 0; i < items.length; i++) {
                          if (items[i].type.indexOf('image') !== -1) {
                            const file = items[i].getAsFile();
                            if (file) {
                              onDrop([file]);
                            }
                          }
                        }
                      }
                    }}
                    onSubmit={chatForm.handleSubmit(onSubmit)}
                    ref={textareaRef}
                    topAddons={
                      <>
                        {isDragActive && <DropFileActive />}
                        {selectedTool && (
                          <SelectedToolChat
                            args={selectedTool.args ?? []}
                            description={selectedTool.description}
                            name={formatText(selectedTool.name)}
                            remove={() => {
                              chatForm.setValue('tool', undefined);
                            }}
                          />
                        )}
                        {!isDragActive &&
                          currentFiles &&
                          currentFiles.length > 0 && (
                            <FileList
                              currentFiles={currentFiles}
                              onRemoveFile={(index) => {
                                const newFiles = [...currentFiles];
                                newFiles.splice(index, 1);
                                chatForm.setValue('files', newFiles, {
                                  shouldValidate: true,
                                });
                              }}
                            />
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
                        !selectedTool &&
                        isSearchToolListSuccess &&
                        searchToolList?.length > 0 &&
                        searchToolList?.map((tool) => (
                          <Tooltip key={tool.tool_router_key}>
                            <TooltipTrigger asChild>
                              <motion.button
                                animate={{ opacity: 1, x: 0 }}
                                className={cn(
                                  'bg-gray-375 hover:bg-gray-450 flex items-center gap-2 rounded-lg px-2 py-1 text-xs text-white transition-colors',
                                )}
                                exit={{ opacity: 0, x: -10 }}
                                initial={{ opacity: 0, x: -10 }}
                                key={tool.tool_router_key}
                                onClick={() => {
                                  chatForm.setValue('tool', {
                                    key: tool.tool_router_key,
                                    name: tool.name,
                                    description: tool.description,
                                    args: Object.keys(
                                      tool.input_args.properties ?? {},
                                    ),
                                  });
                                }}
                                type="button"
                              >
                                <ToolsIcon className="h-3 w-3" />
                                {formatText(tool.name)}
                              </motion.button>
                            </TooltipTrigger>
                            <TooltipPortal>
                              <TooltipContent
                                align="start"
                                className="max-w-[500px]"
                                side="top"
                              >
                                {tool.description}
                              </TooltipContent>
                            </TooltipPortal>
                          </Tooltip>
                        ))}
                      {!debounceMessage && (
                        <span className="text-xs font-light text-gray-100">
                          <span className="font-medium">Shift + Enter</span> for
                          a new line
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

type FileListProps = {
  currentFiles: File[];
  onRemoveFile: (index: number) => void;
};

const FileList = ({ currentFiles, onRemoveFile }: FileListProps) => {
  const size = partial({ standard: 'jedec' });

  return (
    <div className="no-scrollbar bg-gray-375 scroll h-16 overflow-hidden">
      <div className="flex items-center gap-3 overflow-x-auto p-2.5">
        {currentFiles.map((file, index) => (
          <div
            className="relative flex h-10 w-[180px] shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-1 py-1.5 pr-2"
            key={index}
          >
            <div className="flex w-6 shrink-0 items-center justify-center">
              {getFileExt(file.name) && fileIconMap[getFileExt(file.name)] ? (
                <FileTypeIcon
                  className="text-gray-80 h-[18px] w-[18px] shrink-0"
                  type={getFileExt(file.name)}
                />
              ) : (
                <Paperclip className="text-gray-80 h-4 w-4 shrink-0" />
              )}
            </div>

            <div className="text-left text-xs">
              <span className="line-clamp-1 break-all">{file.name}</span>
              <span className="line-clamp-1 break-all text-gray-100">
                {size(file.size)}
              </span>
            </div>
            <button
              className={cn(
                'hover:bg-gray-375 bg-gray-375 text-gray-80 absolute -right-2 -top-2 h-5 w-5 cursor-pointer rounded-full border border-gray-200 p-1 transition-colors hover:text-white',
              )}
              onClick={(event) => {
                event.stopPropagation();
                onRemoveFile(index);
              }}
            >
              <X className="h-full w-full" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const DropFileActive = () => (
  <motion.div
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-375 z-10 flex h-16 w-full items-center justify-center p-2.5"
    initial={{ opacity: 0, y: 10 }}
    transition={{ duration: 0.2 }}
  >
    <div className="w-full rounded-lg border border-dashed border-gray-100">
      <div className="flex w-full items-center justify-center px-4 py-3.5">
        <PlusCircledIcon className="h-4 w-4 text-white" />
        <span className="ml-2 text-xs font-medium text-white">
          Drop file here to add to your conversation
        </span>
      </div>
    </div>
  </motion.div>
);

const SelectedToolChat = ({
  name,
  description,
  args,
  remove,
}: {
  name: string;
  description: string;
  args: string[];
  remove: () => void;
}) => {
  return (
    <div className="bg-gray-375 relative max-w-full rounded-lg p-1.5 px-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-start gap-2 pr-6">
            <ToolsIcon className="mt-1 aspect-square size-3.5" />
            <div className="flex flex-1 flex-col items-start text-xs text-gray-100">
              <span className="line-clamp-1 font-medium text-white">
                {name} -{' '}
                <span className="text-gray-80 font-light">{description}</span>
              </span>
              {args.length > 0 && (
                <span className="text-gray-80">
                  <div className="inline-flex gap-1">
                    <span className="capitalize">Inputs: </span>
                    <div className="inline-flex font-mono">
                      {args.join(', ')}
                    </div>
                  </div>
                </span>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent
            align="start"
            alignOffset={-10}
            className="max-w-[400px]"
            side="top"
            sideOffset={10}
          >
            wellelele
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>

      <button
        className="absolute right-2 top-1.5 text-gray-100 hover:text-white"
        onClick={remove}
        type="button"
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
