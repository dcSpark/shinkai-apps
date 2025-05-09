import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import {
  ChatMessageFormSchema,
  chatMessageFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/chat-message';
import { DEFAULT_CHAT_CONFIG } from '@shinkai_network/shinkai-node-state/v2/constants';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob';
import { useGetAgents } from '@shinkai_network/shinkai-node-state/v2/queries/getAgents/useGetAgents';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import { useGetSearchTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsSearch/useGetToolsSearch';
import {
  Badge,
  Button,
  ChatInputArea,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  AIAgentIcon,
  DirectoryTypeIcon,
  FileTypeIcon,
  PlusIcon,
  SendIcon,
  ToolsIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { useDebounce } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { invoke } from '@tauri-apps/api/core';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, EllipsisIcon, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { AIModelSelector } from '../components/chat/chat-action-bar/ai-update-selection-action-bar';
import {
  chatConfigFormSchema,
  ChatConfigFormSchemaType,
  CreateChatConfigActionBar,
} from '../components/chat/chat-action-bar/chat-config-action-bar';
import { FileSelectionActionBar } from '../components/chat/chat-action-bar/file-selection-action-bar';
import PromptSelectionActionBar from '../components/chat/chat-action-bar/prompt-selection-action-bar';
import { ToolsSwitchActionBar } from '../components/chat/chat-action-bar/tools-switch-action-bar';
import { VectorFsActionBar } from '../components/chat/chat-action-bar/vector-fs-action-bar';
import { useChatStore } from '../components/chat/context/chat-context';
// import { WebSearchActionBar } from '../components/chat/chat-action-bar/web-search-action-bar';
import { useSetJobScope } from '../components/chat/context/set-job-scope-context';
import {
  ChatConversationLocationState,
  DropFileActive,
  FileList,
  SelectedToolChat,
  SUGGESTED_TOOLS_COUNT,
  useSelectedFilesChat,
} from '../components/chat/conversation-footer';
import { FeedbackModal } from '../components/feedback/feedback-modal';
import { usePromptSelectionStore } from '../components/prompt/context/prompt-selection-context';
// import { VideoBanner } from '../components/video-banner';
import { useAnalytics } from '../lib/posthog-provider';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';
import { useViewportStore } from '../store/viewport';
// import { SHINKAI_DOCS_URL, SHINKAI_TUTORIALS } from '../utils/constants';

export const showSpotlightWindow = async () => {
  return invoke('show_spotlight_window_app');
};

const PROMPT_SUGGESTIONS = [
  {
    agentId: 'product_expert',
    text: 'Create a user journey map for a mobile banking app',
    prompt:
      'Create a detailed user journey map for a mobile banking app, including key touchpoints, user actions, emotions, and pain points. Consider the onboarding process, account management, transactions, and customer support interactions.',
  },
  {
    agentId: 'product_expert',
    text: 'Design a checkout flow for an e-commerce platform',
    prompt:
      'Design a checkout flow for an e-commerce platform, including the checkout process, payment methods, and user experience. Consider the user journey, payment security, and order confirmation.',
  },
  {
    agentId: 'seo_strategist',
    text: 'Analyze website SEO and optimizations',
    prompt:
      'Analyze website SEO and provide optimization recommendations, including keyword research, content strategy, and technical SEO improvements.',
  },
  {
    agentId: 'product_expert',
    text: 'Conduct a competitive analysis of food delivery apps',
    prompt:
      'Conduct a competitive analysis of food delivery apps, including key features, user experience, and pricing. Identify opportunities for improvement and recommend strategies for differentiation.',
  },
];

const EmptyMessage = () => {
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const toolListRef = useRef<HTMLDivElement>(null);

  const scrollUpWhenSearchingTools = useCallback(() => {
    requestAnimationFrame(() => {
      toolListRef.current?.scrollTo({ top: 0 });
    });
  }, []);

  const setSetJobScopeOpen = useSetJobScope(
    (state) => state.setSetJobScopeOpen,
  );

  const { captureAnalyticEvent } = useAnalytics();

  const [toolFormData, setToolFormData] = useState<Record<string, any> | null>(
    null,
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chatForm = useForm<ChatMessageFormSchema>({
    resolver: zodResolver(chatMessageFormSchema),
    defaultValues: {
      message: '',
      files: [],
      agent: '',
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

  const promptSelected = usePromptSelectionStore(
    (state) => state.promptSelected,
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const previousFiles = chatForm.getValues('files') ?? [];
      const newFiles = [...previousFiles, ...acceptedFiles];
      chatForm.setValue('files', newFiles, { shouldValidate: true });
      textareaRef.current?.focus();
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

  const { data: recentlyUsedAgents } = useGetAgents({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    categoryFilter: 'recently_used',
  });

  const { data: agents } = useGetAgents({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const { data: toolsList, isSuccess: isToolsListSuccess } = useGetTools(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
    },
    {
      select: (data) => data.filter((tool) => tool.enabled),
    },
  );

  const location = useLocation();

  const locationState = location.state as ChatConversationLocationState;

  const debounceMessage = useDebounce(currentMessage, 500);

  const selectedAgent = agents?.find((agent) => agent.agent_id === currentAI);

  const { data: searchToolList, isSuccess: isSearchToolListSuccess } =
    useGetSearchTools(
      {
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        search: debounceMessage,
      },
      {
        enabled:
          !!debounceMessage &&
          !!currentMessage &&
          !selectedTool &&
          !selectedAgent,
        select: (data) => data.slice(0, 3).filter((item) => item.enabled),
      },
    );

  const selectedKeys = useSetJobScope((state) => state.selectedKeys);
  const onSelectedKeysChange = useSetJobScope(
    (state) => state.onSelectedKeysChange,
  );

  const { t } = useTranslation();

  const resetJobScope = useSetJobScope((state) => state.resetJobScope);

  const setPromptSelected = usePromptSelectionStore(
    (state) => state.setPromptSelected,
  );

  const defaultAgentId = useSettings((state) => state.defaultAgentId);

  useEffect(() => {
    if (!defaultAgentId) return;
    chatForm.setValue('agent', defaultAgentId);
  }, [chatForm, defaultAgentId]);

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
    resetJobScope();
    setPromptSelected(undefined);
  }, []);

  useEffect(() => {
    chatConfigForm.setValue(
      'useTools',
      promptSelected?.useTools ? true : DEFAULT_CHAT_CONFIG.use_tools,
    );
  }, [chatConfigForm, chatForm, promptSelected]);

  useEffect(() => {
    if (promptSelected) {
      chatForm.setValue('message', promptSelected.prompt);
    }
  }, [chatForm, promptSelected]);

  useEffect(() => {
    if (!locationState?.llmProviderId) {
      return;
    }
    chatForm.setValue('agent', locationState.llmProviderId);
  }, [chatForm, locationState]);

  useEffect(() => {
    if (!locationState?.agentName) {
      return;
    }
    chatForm.setValue('agent', locationState.agentName);
    const selectedAgent = agents?.find(
      (agent) => agent.agent_id === locationState.agentName,
    );
    if (selectedAgent && selectedAgent.tools?.length > 0) {
      chatConfigForm.setValue('useTools', true);
    } else {
      chatConfigForm.setValue('useTools', false);
    }
  }, [agents, chatConfigForm, chatForm, locationState]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    textareaRef.current.focus();
  }, [currentMessage]);

  const { selectedFileKeysRef, selectedFolderKeysRef, clearSelectedFiles } =
    useSelectedFilesChat({
      inboxId: '',
    });

  const toolRawInput = useChatStore((state) => state.toolRawInput);
  const chatToolView = useChatStore((state) => state.chatToolView);

  // for suggested tools
  useHotkeys(
    ['mod+1', 'ctrl+1', 'mod+2', 'ctrl+2', 'mod+3', 'ctrl+3'],
    (event) => {
      if (!searchToolList?.length) return;

      const toolNumber = parseInt(event.key);
      if (toolNumber < 1 || toolNumber > SUGGESTED_TOOLS_COUNT) return;
      const selectedTool = searchToolList[toolNumber - 1];
      chatForm.setValue('tool', {
        key: selectedTool.tool_router_key,
        name: selectedTool.name,
        description: selectedTool.description,
        args: selectedTool.input_args,
      });
    },
    {
      enabled: !!searchToolList?.length && !!currentMessage && !selectedTool,
      enableOnFormTags: true,
    },
  );

  const { data: llmProviders } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  // For switching AIs
  useHotkeys(
    ['mod+[', 'mod+]', 'ctrl+[', 'ctrl+]'],
    (event) => {
      if (!llmProviders || !agents) return;
      const allAIs = [
        ...(agents ?? []).map((a) => a.name),
        ...(llmProviders ?? []).map((l) => l.id),
      ];

      const currentIndex = allAIs.indexOf(currentAI ?? '');
      if (currentIndex === -1) return;

      let newIndex;
      if (event.key === '[') {
        newIndex = currentIndex === 0 ? allAIs.length - 1 : currentIndex - 1;
      } else {
        newIndex = currentIndex === allAIs.length - 1 ? 0 : currentIndex + 1;
      }

      chatForm.setValue('agent', allAIs[newIndex]);
    },
    {
      enableOnFormTags: true,
      enabled: !!llmProviders?.length && !!agents?.length && !!currentAI,
    },
  );

  const onSubmit = async (data: ChatMessageFormSchema) => {
    if (!auth || data.message.trim() === '' || !data.agent) return;
    const selectedVRFiles =
      selectedFileKeysRef.size > 0
        ? Array.from(selectedFileKeysRef.values())
        : [];
    const selectedVRFolders =
      selectedFolderKeysRef.size > 0
        ? Array.from(selectedFolderKeysRef.values())
        : [];

    const formattedToolMessage = Object.keys(toolFormData ?? {})
      .map((key) => {
        return `${key}: ${toolFormData?.[key]}`;
      })
      .join('\n');

    let content = data.message;

    if (selectedTool) {
      content = `${selectedTool.name} \n ${formattedToolMessage}`;
    }
    if (toolRawInput && chatToolView === 'raw') {
      content = `${toolRawInput}`;
    }

    await createJob({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      llmProvider: data.agent,
      content: content,
      files: currentFiles,
      isHidden: false,
      toolKey: data.tool?.key,
      selectedVRFiles,
      selectedVRFolders,
      chatConfig: {
        stream: chatConfigForm.getValues('stream'),
        custom_prompt: chatConfigForm.getValues('customPrompt') ?? '',
        temperature: chatConfigForm.getValues('temperature'),
        top_p: chatConfigForm.getValues('topP'),
        top_k: chatConfigForm.getValues('topK'),
        use_tools: chatConfigForm.getValues('useTools'),
      },
    });

    chatForm.reset();
    clearSelectedFiles();
    setToolFormData(null);
  };

  const mainLayoutContainerRef = useViewportStore(
    (state) => state.mainLayoutContainerRef,
  );

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="container-fluid flex w-full flex-col items-stretch gap-20 px-4 text-center md:px-8 lg:px-12"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <FeedbackModal buttonProps={{ className: 'absolute right-4 top-4' }} />
      <div className="mx-auto mt-[110px] flex w-full max-w-[1100px] flex-col items-stretch gap-6">
        <div className="mb-4 flex flex-col items-center gap-2">
          <h1 className="font-clash text-3xl font-medium text-white">
            How can I help you today?
          </h1>
          <AIModelSelector
            onValueChange={(value) => {
              chatForm.setValue('agent', value);
              const selectedAgent = agents?.find(
                (agent) => agent.agent_id === value,
              );
              if (selectedAgent && selectedAgent.tools?.length > 0) {
                chatConfigForm.setValue('useTools', true);
              } else {
                chatConfigForm.setValue('useTools', false);
              }
            }}
            value={currentAI ?? ''}
            variant="card"
          />
        </div>
        <div
          {...getRootFileProps({
            className: 'relative shrink-0 pb-[40px]  mx-auto w-full',
          })}
        >
          <div className="relative z-[1]">
            <Popover onOpenChange={setIsCommandOpen} open={isCommandOpen}>
              <PopoverAnchor>
                <ChatInputArea
                  {...(selectedTool && {
                    alternateElement: (
                      <SelectedToolChat
                        args={selectedTool.args}
                        description={selectedTool.description}
                        name={formatText(selectedTool.name)}
                        onSubmit={() => {
                          chatForm.handleSubmit(onSubmit)();
                        }}
                        onToolFormChange={setToolFormData}
                        remove={() => {
                          chatForm.setValue('tool', undefined);
                          chatForm.setValue('message', '');
                          setToolFormData(null);
                        }}
                        toolFormData={toolFormData}
                      />
                    ),
                  })}
                  autoFocus
                  bottomAddons={
                    <div className="flex items-center justify-between gap-4 px-3 pb-2">
                      <div className="flex items-center gap-2.5">
                        <Popover>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <PopoverTrigger asChild>
                                <Button
                                  className="h-8 w-8 bg-transparent"
                                  size="icon"
                                  variant="ghost"
                                >
                                  <PlusIcon className="h-4 w-4 text-white" />
                                  <span className="sr-only">Add</span>
                                </Button>
                              </PopoverTrigger>
                            </TooltipTrigger>
                            <TooltipPortal>
                              <TooltipContent align="center" side="top">
                                Add
                              </TooltipContent>
                            </TooltipPortal>
                          </Tooltip>
                          <PopoverContent align="start" className="w-48 p-2">
                            <div className="flex flex-col items-start gap-1">
                              {!selectedTool && (
                                <FileSelectionActionBar
                                  disabled={!!selectedTool}
                                  inputProps={{
                                    ...chatForm.register('files'),
                                    ...getInputFileProps(),
                                  }}
                                  onClick={openFilePicker}
                                  showLabel
                                />
                              )}
                              {!selectedTool && (
                                <VectorFsActionBar
                                  aiFilesCount={
                                    Object.keys(selectedKeys || {}).length ?? 0
                                  }
                                  disabled={!!selectedTool}
                                  onClick={() => {
                                    setSetJobScopeOpen(true);
                                  }}
                                  showLabel
                                />
                              )}
                              {!selectedTool && (
                                <PromptSelectionActionBar showLabel />
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>

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
                        {/* <WebSearchActionBar
                                      checked={chatConfigForm.watch('useTools')}
                                      onClick={() => {
                                        chatConfigForm.setValue(
                                          'useTools',
                                          !chatConfigForm.watch('useTools'),
                                        );
                                      }}
                                    /> */}
                      </div>

                      <div className="flex items-center gap-2">
                        <CreateChatConfigActionBar form={chatConfigForm} />

                        <Button
                          className={cn('size-[36px] p-2')}
                          disabled={
                            isPending || (!selectedTool && !currentMessage)
                          }
                          form={
                            selectedTool && chatToolView === 'form'
                              ? 'tools-form'
                              : undefined
                          }
                          isLoading={isPending}
                          onClick={
                            selectedTool && chatToolView === 'form'
                              ? undefined
                              : chatForm.handleSubmit(onSubmit)
                          }
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
                  className="rounded-2xl"
                  disabled={isPending}
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
                  textareaClassName={cn(
                    'h-full max-h-[60vh] min-h-[200px] p-4 text-base',
                  )}
                  topAddons={
                    <>
                      {isDragActive && <DropFileActive />}
                      {!isDragActive &&
                        currentFiles &&
                        currentFiles.length > 0 && (
                          <FileList
                            currentFiles={currentFiles}
                            isPending={isPending}
                            onRemoveFile={(index) => {
                              const newFiles = [...currentFiles];
                              newFiles.splice(index, 1);
                              chatForm.setValue('files', newFiles, {
                                shouldValidate: true,
                              });
                            }}
                          />
                        )}
                      {selectedKeys &&
                        Object.keys(selectedKeys || {}).length > 0 && (
                          <div className="no-scrollbar bg-official-gray-800/10 scroll border-official-gray-780 h-16 overflow-hidden border-b">
                            <div className="flex items-center gap-3 overflow-x-auto p-2.5">
                              {Object.keys(selectedKeys).map((file, index) => (
                                <div
                                  className="border-official-gray-780 relative flex h-10 w-[180px] shrink-0 items-center gap-1.5 rounded-lg border px-1 py-1.5 pr-2.5"
                                  key={file + index}
                                >
                                  <div className="flex w-6 shrink-0 items-center justify-center">
                                    {isFileOrFolder(file) === 'file' ? (
                                      <FileTypeIcon className="text-official-gray-400 size-4 shrink-0" />
                                    ) : (
                                      <DirectoryTypeIcon className="text-official-gray-400 size-4 shrink-0" />
                                    )}
                                  </div>

                                  <div className="text-left text-xs">
                                    <span className="line-clamp-1 break-all">
                                      {file}
                                    </span>
                                  </div>
                                  <button
                                    className={cn(
                                      'bg-official-gray-850 hover:bg-official-gray-800 text-gray-80 border-official-gray-780 absolute -right-2 -top-2 h-5 w-5 cursor-pointer rounded-full border p-1 transition-colors hover:text-white',
                                    )}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      const newKeys = { ...selectedKeys };
                                      delete newKeys[file];
                                      onSelectedKeysChange(newKeys);
                                    }}
                                  >
                                    <X className="h-full w-full" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
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
                                args: tool.input_args,
                              });
                              chatConfigForm.setValue('useTools', true);
                              chatForm.setValue('message', 'Tool Used');
                              setIsCommandOpen(false);
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

          <motion.div
            animate={{ opacity: 1 }}
            className={cn(
              'bg-official-gray-850 absolute inset-x-2 bottom-1.5 z-0 flex h-[40px] justify-between gap-2 rounded-b-xl px-2 pb-1 pt-2.5 shadow-white',
            )}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {!!debounceMessage &&
              !selectedTool &&
              !selectedAgent &&
              isSearchToolListSuccess &&
              searchToolList?.length > 0 && (
                <div className="flex items-center gap-2 px-2">
                  <span className="text-official-gray-400 pr-1 text-xs font-light">
                    Suggested Tools
                  </span>
                  {searchToolList?.map((tool, idx) => (
                    <Tooltip key={tool.tool_router_key}>
                      <TooltipTrigger asChild>
                        <motion.button
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            'hover:bg-official-gray-800 flex items-center gap-2 rounded-lg px-2 py-1 text-xs text-white transition-colors',
                          )}
                          exit={{ opacity: 0, x: -10 }}
                          initial={{ opacity: 0, x: -10 }}
                          key={tool.tool_router_key}
                          onClick={() => {
                            chatForm.setValue('tool', {
                              key: tool.tool_router_key,
                              name: tool.name,
                              description: tool.description,
                              args: tool.input_args,
                            });
                            chatConfigForm.setValue('useTools', true);
                            chatForm.setValue('message', 'Tool Used');
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

                          <br />
                          <div className="flex items-center justify-end gap-2 text-xs text-gray-100">
                            <CommandShortcut>⌘ + {idx + 1}</CommandShortcut>
                          </div>
                        </TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  ))}
                  <Link
                    className={cn(
                      'hover:bg-official-gray-800 flex items-center gap-2 rounded-lg px-2 py-1 text-xs text-white transition-colors',
                    )}
                    to="/tools"
                  >
                    <EllipsisIcon className="size-4" />
                    All Tools
                  </Link>
                </div>
              )}
            {(!debounceMessage || selectedTool || selectedAgent) && (
              <div className="flex w-full items-center justify-between gap-2 px-2">
                <span className="text-official-gray-400 text-xs font-light">
                  <span className="font-medium">Shift + Enter</span> for a new
                  line
                </span>
                <span className="text-official-gray-400 text-xs font-light">
                  <span className="font-medium">Enter</span> to send
                </span>
              </div>
            )}
          </motion.div>
        </div>
        <div className="mx-auto grid w-full max-w-6xl grid-cols-4 justify-center gap-3">
          {PROMPT_SUGGESTIONS.map((suggestion) => (
            <Badge
              className="hover:bg-official-gray-900 hover:text-official-gray-100 text-official-gray-200 cursor-pointer justify-between text-balance rounded-xl px-2 py-1.5 text-left text-sm font-normal normal-case transition-colors"
              key={suggestion.text}
              onClick={() => {
                chatForm.setValue('message', suggestion.prompt);
                if (suggestion.agentId) {
                  chatForm.setValue('agent', suggestion.agentId);
                }
              }}
              variant="outline"
            >
              {suggestion.text}
              <ArrowUpRight className="ml-2 h-3.5 w-3.5 shrink-0" />
            </Badge>
          ))}
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 pb-10">
        {(recentlyUsedAgents ?? []).length > 0 && (
          <div className="flex flex-col gap-5">
            <SectionHeading
              action={{
                label: 'New Agent',
                onClick: () => navigate('/add-agent'),
              }}
              title="Recently Used"
            />
            <div className="grid grid-cols-1 gap-4">
              {recentlyUsedAgents?.map((agent, idx) => (
                <Card
                  action={{
                    label: 'Chat with Agent',
                    onClick: () => {
                      chatForm.setValue('agent', agent.agent_id);
                      if (agent.tools?.length > 0) {
                        chatConfigForm.setValue('useTools', true);
                      } else {
                        chatConfigForm.setValue('useTools', false);
                      }
                      mainLayoutContainerRef?.current?.scrollTo({
                        top: 0,
                        behavior: 'smooth',
                      });
                    },
                  }}
                  delay={idx * 0.1}
                  description={agent.ui_description}
                  icon={<AIAgentIcon className="size-full" name={agent.name} />}
                  key={agent.agent_id}
                  secondaryAction={{
                    label: 'Chat History',
                    onClick: () => {
                      navigate(`/inboxes?agentId=${agent.agent_id}`);
                    },
                  }}
                  title={agent.name}
                />
              ))}
            </div>
          </div>
        )}
        {(agents ?? []).length > 0 &&
          (recentlyUsedAgents ?? []).length === 0 && (
            <div className="flex flex-col gap-5">
              <SectionHeading
                action={{
                  label: 'New Agent',
                  onClick: () => navigate('/add-agent'),
                }}
                title="Recommended Agents"
              />
              <div className="grid grid-cols-1 gap-4">
                {agents?.map((agent, idx) => (
                  <Card
                    action={{
                      label: 'Chat with Agent',
                      onClick: () => {
                        chatForm.setValue('agent', agent.agent_id);
                        if (agent.tools?.length > 0) {
                          chatConfigForm.setValue('useTools', true);
                        } else {
                          chatConfigForm.setValue('useTools', false);
                        }
                        mainLayoutContainerRef?.current?.scrollTo({
                          top: 0,
                          behavior: 'smooth',
                        });
                      },
                    }}
                    delay={idx * 0.1}
                    description={agent.ui_description}
                    icon={
                      <AIAgentIcon className="size-full" name={agent.name} />
                    }
                    key={agent.agent_id}
                    secondaryAction={{
                      label: 'Chat History',
                      onClick: () => {
                        navigate(`/inboxes?agentId=${agent.agent_id}`);
                      },
                    }}
                    title={agent.name}
                  />
                ))}
              </div>
            </div>
          )}
      </div>
    </motion.div>
  );
};
export default EmptyMessage;

function isFileOrFolder(path: string) {
  const filePattern = /.*\.[^\\/]+$/;
  const isFile = filePattern.test(path);
  return isFile ? 'file' : 'folder';
}

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: {
    label: string;
    onClick: () => void;
  };
  delay?: number;
  className?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}
const Card: React.FC<CardProps> = ({
  icon,
  title,
  description,
  action,
  delay = 0,
  className,
  secondaryAction,
}) => {
  const delayClass = `animate-delay-${delay}`;

  return (
    <div
      className={cn(
        'bg-official-gray-900 animate-scale-in border-official-gray-850 group relative overflow-hidden rounded-2xl border p-3 transition-all duration-300',
        delayClass,
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative z-10 flex items-start gap-3">
        <div className="flex size-10 items-center justify-center">{icon}</div>
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="text-left text-base font-medium capitalize">
            {title}
          </h3>
          <p className="text-official-gray-400 line-clamp-2 h-10 text-balance text-left text-sm">
            {description || 'No description available'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {secondaryAction && (
            <Button
              className="shrink-0 text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/5 hover:text-white"
              onClick={secondaryAction.onClick}
              size="sm"
              variant="tertiary"
            >
              {secondaryAction.label}
            </Button>
          )}
          <Button
            className="shrink-0 text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/5 hover:text-white"
            onClick={action.onClick}
            size="sm"
            variant="tertiary"
          >
            {action.label}
            <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface SectionHeadingProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  viewAll?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  description,
  action,
  viewAll,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-start justify-between md:flex-row md:items-center',
        className,
      )}
    >
      <div className="animate-fade-in animate-delay-100 text-left">
        <h2 className="text-balance text-lg font-medium tracking-normal">
          {title}
        </h2>
        {description && (
          <p className="text-official-gray-400 text-sm">{description}</p>
        )}
      </div>
      <div className="animate-fade-in animate-delay-200 mt-4 flex items-center space-x-3 md:mt-0">
        {viewAll && (
          <Button onClick={viewAll.onClick} size="sm" variant="outline">
            {viewAll.label}
            <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Button>
        )}
        {action && (
          <Button onClick={action.onClick} size="sm" variant="outline">
            <Plus className="h-3.5 w-3.5" />
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
};
