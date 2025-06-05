import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { type ShinkaiToolHeader } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import {
  buildInboxIdFromJobId,
  extractJobIdFromInbox,
} from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import {
  type CreateJobFormSchema,
  createJobFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/create-job';
import { DEFAULT_CHAT_CONFIG } from '@shinkai_network/shinkai-node-state/v2/constants';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/v2/mutations/sendMessageToJob/useSendMessageToJob';
import { useGetAgents } from '@shinkai_network/shinkai-node-state/v2/queries/getAgents/useGetAgents';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import {
  Button,
  ChatInputArea,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Form,
  Popover,
  PopoverAnchor,
  PopoverContent,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { SendIcon, ToolsIcon } from '@shinkai_network/shinkai-ui/assets';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { motion } from 'framer-motion';
import { PlusIcon } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'sonner';

import {
  chatConfigFormSchema,
  type ChatConfigFormSchemaType,
} from '../../../components/chat/chat-action-bar/chat-config-action-bar';
import { FileSelectionActionBar } from '../../../components/chat/chat-action-bar/file-selection-action-bar';
import { ToolsSwitchActionBar } from '../../../components/chat/chat-action-bar/tools-switch-action-bar';
import {
  DropFileActive,
  FileList,
} from '../../../components/chat/conversation-footer';
import { useWebSocketMessage } from '../../../components/chat/websocket-message';
import { useChatConversationWithOptimisticUpdates } from '../../../pages/chat/chat-conversation';
import { useAuth } from '../../../store/auth';
import { useSettings } from '../../../store/settings';
import { useQuickAskStore } from '../context/quick-ask';
import { AIModelSelector, AiUpdateSelection } from './ai-update-selection';
import { MessageList } from './message-list';

export const hideSpotlightWindow = async () => {
  return invoke('hide_spotlight_window_app');
};

export const useDefaultSpotlightAiByDefault = () => {
  const auth = useAuth((state) => state.auth);
  const defaultSpotlightAiId = useSettings(
    (state) => state.defaultSpotlightAiId,
  );
  const setDefaultSpotlightAiId = useSettings(
    (state) => state.setDefaultSpotlightAiId,
  );
  const { llmProviders, isSuccess } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  useEffect(() => {
    if (isSuccess && llmProviders?.length && !defaultSpotlightAiId) {
      setDefaultSpotlightAiId(llmProviders[0].id);
    }
  }, [llmProviders, isSuccess, setDefaultSpotlightAiId, defaultSpotlightAiId]);

  return {
    defaultSpotlightAiId,
    setDefaultSpotlightAiId,
  };
};

function QuickAsk() {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();

  const inboxId = useQuickAskStore((state) => state.inboxId);
  const setInboxId = useQuickAskStore((state) => state.setInboxId);

  const { defaultSpotlightAiId, setDefaultSpotlightAiId } =
    useDefaultSpotlightAiByDefault();

  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const { data: toolsList, isSuccess: isToolsListSuccess } = useGetTools(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
    },
    {
      select: (data: ShinkaiToolHeader[]) =>
        data.filter((tool) => tool.enabled),
    },
  );

  useHotkeys(
    ['esc'],
    () => {
      void hideSpotlightWindow();
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
    },
  );

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
      useTools: DEFAULT_CHAT_CONFIG.use_tools,
    },
  });

  const selectedTool = chatForm.watch('tool');
  const currentMessage = chatForm.watch('message');
  const currentFiles = chatForm.watch('files');
  const currentAI = chatForm.watch('agent');

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const previousFiles = chatForm.getValues('files') ?? [];
      const newFiles = [...previousFiles, ...acceptedFiles];
      chatForm.setValue('files', newFiles, { shouldValidate: true });
      // textareaRef.current?.focus();
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

  useEffect(() => {
    const unlisten = listen('tauri://focus', () => {
      chatForm.setFocus('message');
    });

    return () => {
      void unlisten.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    chatForm.reset({
      message: '',
      agent: defaultSpotlightAiId,
      files: [],
    });
    setInboxId(null);
  }, []);

  const { mutateAsync: createJob } = useCreateJob({
    onSuccess: (data) => {
      const inboxId = buildInboxIdFromJobId(data.jobId);
      setInboxId(inboxId);
      chatForm.reset({
        message: '',
        agent: defaultSpotlightAiId,
        files: [],
      });
    },
    onError: (error) => {
      toast.error('Failed to send message', {
        description: error?.response?.data?.message ?? error.message,
      });
    },
  });

  const toolListRef = useRef<HTMLDivElement>(null);

  const scrollUpWhenSearchingTools = useCallback(() => {
    requestAnimationFrame(() => {
      toolListRef.current?.scrollTo({ top: 0 });
    });
  }, []);

  const { data: agents } = useGetAgents({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const { mutateAsync: sendMessageToJob } = useSendMessageToJob({});

  const selectedAgent = agents?.find((agent) => agent.agent_id === currentAI);

  useEffect(() => {
    chatForm.setValue('agent', defaultSpotlightAiId);
  }, [chatForm, defaultSpotlightAiId]);

  const onSubmit = async (data: CreateJobFormSchema) => {
    if (!auth) return;

    if (!inboxId) {
      await createJob({
        nodeAddress: auth.node_address,
        token: auth.api_v2_key,
        llmProvider: data.agent,
        content: data.message,
        isHidden: false,
        toolKey: data.tool?.key,
        chatConfig: {
          stream: chatConfigForm.getValues('stream'),
          custom_prompt: chatConfigForm.getValues('customPrompt') ?? '',
          temperature: chatConfigForm.getValues('temperature'),
          top_p: chatConfigForm.getValues('topP'),
          top_k: chatConfigForm.getValues('topK'),
          use_tools: chatConfigForm.getValues('useTools'),
        },
      });
      return;
    }

    await sendMessageToJob({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      jobId: inboxId ? extractJobIdFromInbox(inboxId) : '',
      message: data.message,
      parent: '',
    });

    chatForm.reset({
      message: '',
      agent: defaultSpotlightAiId,
      files: [],
    });
  };

  return (
    <Form {...chatForm}>
      <div className="relative flex size-full flex-col gap-2">
        <div
          className="absolute top-0 z-50 h-4 w-full"
          data-tauri-drag-region={true}
        />
        <div className="font-lg flex h-[60px] items-center justify-between px-3 py-1.5">
          <span className="pl-1 text-base">{inboxId ? null : 'New Chat'}</span>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="tertiary"
                  size="icon"
                  onClick={() => {
                    setInboxId(null);
                    chatForm.reset({
                      message: '',
                      agent: defaultSpotlightAiId,
                      files: [],
                    });
                  }}
                  type="button"
                >
                  <PlusIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New Chat</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="tertiary"
                  size="icon"
                  onClick={() => {
                    setInboxId(null);
                  }}
                  type="button"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="size-4"
                  >
                    <path
                      d="M12.5667 7.93408L15.3088 8.03416C15.7163 8.04903 16.0391 8.38374 16.0391 8.79156V11.4064M10.5391 13.4341L15.5828 8.41565"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                    <path
                      d="M2 17C2 15.1144 2 14.1716 2.58579 13.5858C3.17157 13 4.11438 13 6 13H7C8.88562 13 9.82843 13 10.4142 13.5858C11 14.1716 11 15.1144 11 17V18C11 19.8856 11 20.8284 10.4142 21.4142C9.82843 22 8.88562 22 7 22H6C4.11438 22 3.17157 22 2.58579 21.4142C2 20.8284 2 19.8856 2 18V17Z"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                    <path
                      d="M2 8.5V10.5M14 2H10M22 14V10M13.5 22H15.5M2.05986 5.5C2.21387 4.43442 2.51347 3.67903 3.09625 3.09625C3.67903 2.51347 4.43442 2.21387 5.5 2.05986M18.5 2.05986C19.5656 2.21387 20.321 2.51347 20.9037 3.09625C21.4865 3.67903 21.7861 4.43442 21.9401 5.5M21.9401 18.5C21.7861 19.5656 21.4865 20.321 20.9037 20.9037C20.321 21.4865 19.5656 21.7861 18.5 21.9401"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    ></path>
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open in App</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <QuickAskBody />
        <div
          {...getRootFileProps({
            className: 'relative shrink-0 px-3 pb-3 mx-auto w-full',
          })}
        >
          <div className="relative z-[1]">
            <Popover onOpenChange={setIsCommandOpen} open={isCommandOpen}>
              <PopoverAnchor>
                <ChatInputArea
                  autoFocus
                  bottomAddons={
                    <div className="flex items-center justify-between gap-4 px-3 pb-2">
                      <div className="flex items-center gap-2.5">
                        {!inboxId ? (
                          <AIModelSelector
                            onValueChange={(value) => {
                              chatForm.setValue('agent', value);
                              setDefaultSpotlightAiId(value);
                            }}
                            value={chatForm.watch('agent')}
                          />
                        ) : (
                          <AiUpdateSelection inboxId={inboxId ?? ''} />
                        )}

                        {!selectedTool && (
                          <FileSelectionActionBar
                            disabled={!!selectedTool}
                            inputProps={{
                              ...chatForm.register('files'),
                              ...getInputFileProps(),
                            }}
                            onClick={openFilePicker}
                          />
                        )}

                        {!selectedTool && !selectedAgent && (
                          <ToolsSwitchActionBar
                            checked={chatConfigForm.watch('useTools')}
                            onClick={() => {
                              chatConfigForm.setValue(
                                'useTools',
                                !chatConfigForm.watch('useTools'),
                              );
                            }}
                          />
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          className={cn('size-[36px] p-2')}
                          // disabled={isPending || (!selectedTool && !currentMessage)}
                          // isLoading={isPending}
                          onClick={chatForm.handleSubmit(onSubmit)}
                          size="icon"
                        >
                          <SendIcon className="h-full w-full" />
                          <span className="sr-only">
                            {t('chat.sendMessage')}
                          </span>
                        </Button>
                      </div>
                    </div>
                  }
                  className="rounded-xl"
                  // disabled={isPending}
                  onChange={(value) => {
                    chatForm.setValue('message', value);
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === '/' &&
                      !e.shiftKey &&
                      !e.ctrlKey &&
                      !e.metaKey &&
                      !currentMessage.trim()
                    ) {
                      e.preventDefault();
                      setIsCommandOpen(true);
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
                  textareaClassName={cn(
                    'max-h-[60vh] min-h-[60px] p-3 text-sm',
                  )}
                  topAddons={
                    <>
                      {isDragActive && <DropFileActive />}
                      {!isDragActive &&
                        currentFiles &&
                        currentFiles.length > 0 && (
                          <FileList
                            currentFiles={currentFiles}
                            // isPending={isPending}
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
                  value={chatForm.watch('message')}
                />
              </PopoverAnchor>
              <PopoverContent
                align="start"
                className="w-[500px] p-0"
                side="bottom"
                sideOffset={-200}
              >
                <Command>
                  <CommandInput
                    onValueChange={scrollUpWhenSearchingTools}
                    placeholder="Search tools..."
                  />
                  <CommandList ref={toolListRef}>
                    <CommandEmpty>No tools found.</CommandEmpty>
                    <CommandGroup heading="Your Active Tools">
                      {isToolsListSuccess &&
                        toolsList?.map((tool) => (
                          <CommandItem
                            key={tool.tool_router_key}
                            onSelect={() => {
                              chatForm.setValue('tool', {
                                key: tool.tool_router_key,
                                name: tool.name,
                                description: tool.description,
                                args: Object.keys(
                                  tool.input_args.properties ?? {},
                                ),
                              });
                              chatConfigForm.setValue('useTools', true);
                              chatForm.setValue('message', 'Tool Used');
                              setIsCommandOpen(false);
                              const input = document.querySelector('input');
                              if (input) {
                                input.focus();
                              }
                            }}
                          >
                            <ToolsIcon className="mr-2 h-4 w-4" />
                            <div className="flex flex-col gap-0.5 text-xs">
                              <span className="line-clamp-1 text-white">
                                {formatText(tool.name)}
                              </span>
                              <span className="text-gray-80 line-clamp-2 text-xs">
                                {tool.description}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </Form>
  );
}

export default QuickAsk;

const QuickAskBody = () => {
  const inboxId = useQuickAskStore((state) => state.inboxId);

  const decodedInboxId = decodeURIComponent(inboxId ?? '');
  if (!decodedInboxId) {
    return (
      <div className="flex h-full w-full flex-1 items-center justify-center px-2.5 py-6">
        <motion.div
          animate={{ opacity: 1 }}
          className="flex max-w-lg flex-col items-center gap-2 text-center"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="font-clash text-2xl text-white">
            How can I help you today?
          </h1>
        </motion.div>
      </div>
    );
  }
  return <QuickAskBodyWithResponse inboxId={decodedInboxId} />;
};

const QuickAskBodyWithResponseBase = ({ inboxId }: { inboxId: string }) => {
  const { t } = useTranslation();
  const setLoadingResponse = useQuickAskStore(
    (state) => state.setLoadingResponse,
  );
  const setMessageResponse = useQuickAskStore(
    (state) => state.setMessageResponse,
  );

  const {
    data,
    fetchPreviousPage,
    hasPreviousPage,
    isChatConversationLoading,
    isFetchingPreviousPage,
    isChatConversationSuccess,
  } = useChatConversationWithOptimisticUpdates({
    inboxId,
  });

  useWebSocketMessage({
    enabled: !!inboxId,
    inboxId: inboxId,
  });

  useEffect(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    if (
      lastMessage?.role === 'assistant' &&
      lastMessage?.status.type === 'running'
    ) {
      setLoadingResponse(true);
    } else if (
      lastMessage?.role === 'assistant' &&
      lastMessage?.status.type === 'complete'
    ) {
      setLoadingResponse(false);
      setMessageResponse(lastMessage?.content ?? '');
    }
  }, [data, setLoadingResponse, setMessageResponse]);

  return (
    <MessageList
      containerClassName="px-4 py-2"
      // editAndRegenerateMessage={editAndRegenerateMessage}
      fetchPreviousPage={fetchPreviousPage}
      hasPreviousPage={hasPreviousPage}
      isFetchingPreviousPage={isFetchingPreviousPage}
      isLoading={isChatConversationLoading}
      isSuccess={isChatConversationSuccess}
      noMoreMessageLabel={t('chat.allMessagesLoaded')}
      paginatedMessages={data}
      // regenerateMessage={regenerateMessage}
    />
  );
};

const QuickAskBodyWithResponse = memo(
  QuickAskBodyWithResponseBase,
  (prevProps, nextProps) => prevProps.inboxId === nextProps.inboxId,
);
