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
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import { useGetSearchTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsSearch/useGetToolsSearch';
import {
  Badge,
  Button,
  buttonVariants,
  ChatInputArea,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  AIAgentIcon,
  CreateAIIcon,
  SendIcon,
  ToolsIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { useDebounce } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { invoke } from '@tauri-apps/api/core';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
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
import { useSetJobScope } from '../components/chat/context/set-job-scope-context';
import ConversationChatFooter, {
  DropFileActive,
  FileList,
  SelectedToolChat,
  useSelectedFilesChat,
} from '../components/chat/conversation-footer';
import { usePromptSelectionStore } from '../components/prompt/context/prompt-selection-context';
import { useAnalytics } from '../lib/posthog-provider';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';
import { useShinkaiNodeManager } from '../store/shinkai-node-manager';

export const showSpotlightWindow = async () => {
  return invoke('show_spotlight_window_app');
};

const EmptyMessage = () => {
  const auth = useAuth((state) => state.auth);

  const isLoadingMessage = false;
  const { captureAnalyticEvent } = useAnalytics();

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

  const { data: agents } = useGetAgents(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
    },
    {
      select: (data) => data.slice(0, 3),
    },
  );

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

  const locationState = location.state as {
    agentName: string;
  };

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
        select: (data) => data.slice(0, 3).filter((item) => item.enabled),
      },
    );

  const isLocalShinkaiNodeIsUse = useShinkaiNodeManager(
    (state) => state.isInUse,
  );
  const { t } = useTranslation();

  const resetJobScope = useSetJobScope((state) => state.resetJobScope);

  const setPromptSelected = usePromptSelectionStore(
    (state) => state.setPromptSelected,
  );
  const navigate = useNavigate();
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
    if (!textareaRef.current) return;
    textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    textareaRef.current.focus();
  }, [currentMessage]);

  const { selectedFileKeysRef, selectedFolderKeysRef, clearSelectedFiles } =
    useSelectedFilesChat({
      inboxId: '',
    });

  const isAgentInbox = locationState?.agentName;

  const onSubmit = async (data: ChatMessageFormSchema) => {
    if (!auth || data.message.trim() === '') return;
    if (data.agent) {
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
      clearSelectedFiles();

      return;
    }
    chatForm.reset();
  };

  const onCreateJob = async (message: string) => {
    if (!auth) return;
    await createJob({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      llmProvider: defaultAgentId,
      content: message,
      isHidden: false,
      chatConfig: {
        stream: DEFAULT_CHAT_CONFIG.stream,
        custom_prompt: '',
        temperature: DEFAULT_CHAT_CONFIG.temperature,
        top_p: DEFAULT_CHAT_CONFIG.top_p,
        top_k: DEFAULT_CHAT_CONFIG.top_k,
        use_tools: DEFAULT_CHAT_CONFIG.use_tools,
      },
    });
  };

  const selectedAgent = agents?.find((agent) => agent.agent_id === currentAI);

  return (
    <div
      className="flex size-full justify-center p-6"
      // style={{ contain: 'strict' }}
    >
      <motion.div
        animate={{ opacity: 1 }}
        className="flex w-full max-w-4xl flex-col items-stretch gap-28 text-center"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mx-auto mt-[110px] flex w-full flex-col items-stretch gap-4">
          <div className="flex h-[52px] flex-col gap-2">
            {selectedAgent ? (
              <div>
                <p className="font-clash text-2xl font-medium uppercase text-white">
                  {selectedAgent.name}
                </p>
                <p className="text-official-gray-400 text-sm">
                  {selectedAgent.ui_description}
                </p>
              </div>
            ) : (
              <h1 className="font-clash text-4xl font-medium text-white">
                How can I help you today?
              </h1>
            )}
          </div>
          <div
            {...getRootFileProps({
              className:
                'relative shrink-0 pb-[40px] max-w-3xl  mx-auto w-full z-[1] ',
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
                      <div className="">
                        <Popover
                          onOpenChange={setIsCommandOpen}
                          open={isCommandOpen}
                        >
                          <PopoverTrigger asChild>
                            <ChatInputArea
                              autoFocus
                              bottomAddons={
                                <div className="flex items-center justify-between gap-4 px-1 pt-1">
                                  <div className="flex items-center gap-2.5">
                                    <AIModelSelector
                                      onValueChange={(value) => {
                                        chatForm.setValue('agent', value);
                                      }}
                                      value={currentAI ?? ''}
                                    />

                                    <FileSelectionActionBar
                                      inputProps={{
                                        ...chatForm.register('files'),
                                        ...getInputFileProps(),
                                      }}
                                      onClick={openFilePicker}
                                    />
                                    <PromptSelectionActionBar />

                                    <ToolsSwitchActionBar
                                      checked={chatConfigForm.watch('useTools')}
                                      onCheckedChange={(checked) => {
                                        chatConfigForm.setValue(
                                          'useTools',
                                          checked,
                                        );
                                      }}
                                    />
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <CreateChatConfigActionBar
                                      form={chatConfigForm}
                                    />
                                    <Button
                                      className={cn(
                                        'hover:bg-app-gradient bg-official-gray-800 h-[40px] w-[40px] cursor-pointer rounded-full p-3 transition-colors',
                                      )}
                                      disabled={
                                        isLoadingMessage || !currentMessage
                                      }
                                      onClick={chatForm.handleSubmit(onSubmit)}
                                      size="icon"
                                      // variant=""
                                    >
                                      <SendIcon className="h-full w-full" />
                                      <span className="sr-only">
                                        {t('chat.sendMessage')}
                                      </span>
                                    </Button>
                                  </div>
                                </div>
                              }
                              // bottomAddons={
                              //   <div className="relative z-50 flex items-end gap-3 self-end">
                              //     {!debounceMessage && (
                              //       <span className="pb-1 text-xs font-light text-gray-100">
                              //         <span className="font-medium">Enter</span>{' '}
                              //         to send
                              //       </span>
                              //     )}
                              //     <Button
                              //       className={cn(
                              //         'hover:bg-app-gradient h-[40px] w-[40px] cursor-pointer rounded-xl bg-gray-500 p-3 transition-colors',
                              //         'disabled:text-gray-80 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border disabled:border-gray-200 disabled:bg-gray-300 hover:disabled:bg-gray-300',
                              //       )}
                              //       disabled={
                              //         isLoadingMessage || !currentMessage
                              //       }
                              //       onClick={chatForm.handleSubmit(onSubmit)}
                              //       size="icon"
                              //       variant="tertiary"
                              //     >
                              //       <SendIcon className="h-full w-full" />
                              //       <span className="sr-only">
                              //         {t('chat.sendMessage')}
                              //       </span>
                              //     </Button>
                              //   </div>
                              // }
                              // disabled={isLoadingMessage || isPending}
                              onChange={field.onChange}
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
                                  promptSelected?.prompt ===
                                    chatForm.watch('message')
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
                              textareaClassName="max-h-[40vh] min-h-[100px]"
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
                                </>
                              }
                              value={field.value}
                            />
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="w-[500px] p-0"
                            side="bottom"
                            sideOffset={-50}
                          >
                            <Command>
                              <CommandInput placeholder="Search tools..." />
                              <CommandList>
                                <CommandEmpty>No tools found.</CommandEmpty>
                                <CommandGroup heading="Your Active Tools">
                                  {isToolsListSuccess &&
                                    toolsList?.map((tool) => (
                                      <CommandItem
                                        className="data-[selected='true']:bg-gray-200"
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
                                          chatConfigForm.setValue(
                                            'useTools',
                                            true,
                                          );
                                          setIsCommandOpen(false);
                                        }}
                                      >
                                        <ToolsIcon className="mr-2 h-4 w-4" />
                                        <div className="flex flex-col">
                                          <span className="line-clamp-1 text-white">
                                            {formatText(tool.name)}
                                          </span>
                                          <span className="text-gray-80 line-clamp-3 text-xs">
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
                    </FormControl>
                  </FormItem>
                )}
              />
            </Form>
            <motion.div
              animate={{ opacity: 1 }}
              className={cn(
                'bg-official-gray-900/60 absolute inset-x-0 bottom-[1px] flex h-[40px] w-full items-center justify-between gap-2 rounded-b-lg px-2 py-2 shadow-white',
                (searchToolList ?? [])?.length > 0 &&
                  'bg-official-gray-1000/30',
              )}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {!!debounceMessage &&
                !selectedTool &&
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
                        buttonVariants({
                          variant: 'link',
                          size: 'xs',
                        }),
                        'text-official-gray-200 underline',
                      )}
                      to="/tools"
                    >
                      Explore more Tools
                    </Link>
                  </div>
                )}
              {(!debounceMessage || selectedTool) && (
                <div className="flex w-full items-center justify-between gap-2 px-2">
                  <span className="text-official-gray-400 text-xs font-light">
                    <span className="font-medium">Shift + Enter</span> for a new
                    line
                  </span>
                  <span className="text-official-gray-400 pb-1 text-xs font-light">
                    <span className="font-medium">Enter</span> to send
                  </span>
                </div>
              )}
            </motion.div>
          </div>
          <div className="mt-3 flex w-full flex-wrap justify-center gap-3">
            <Badge
              className="hover:bg-official-gray-900 cursor-pointer justify-between text-balance rounded-full py-1.5 text-left font-normal normal-case text-gray-50 transition-colors"
              onClick={() => showSpotlightWindow()}
              variant="outline"
            >
              Quick Ask Spotlight
              <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
            </Badge>
            {[
              {
                text: 'Search in DuckDuckGo',
                prompt: 'Search in DuckDuckGo for: ',
              },
              {
                text: 'Summarize a Youtube video',
                prompt: 'Summarize a Youtube video: ',
              },
            ].map((suggestion) => (
              <Badge
                className="hover:bg-official-gray-900 cursor-pointer justify-between text-balance rounded-full py-1.5 text-left font-normal normal-case text-gray-50 transition-colors"
                key={suggestion.text}
                onClick={() => {
                  setPromptSelected({
                    name: '',
                    prompt: suggestion.prompt,
                    is_enabled: true,
                    is_favorite: false,
                    is_system: true,
                    version: '1',
                    useTools: true,
                    rowid: 0,
                  });
                  const element = document.querySelector(
                    '#chat-input',
                  ) as HTMLDivElement;
                  if (element) {
                    element?.focus?.();
                  }
                }}
                variant="outline"
              >
                {suggestion.text}
                <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
              </Badge>
            ))}
            <Badge
              className="hover:bg-official-gray-900 cursor-pointer justify-between text-balance rounded-full py-1.5 text-left font-normal normal-case text-gray-50 transition-colors"
              onClick={() => onCreateJob('Tell me about the Roman Empire')}
              variant="outline"
            >
              Tell me about the Roman Empire
              <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 text-left">
              <h1 className="text-base font-medium">Explore AI Agents</h1>
              <p className="text-official-gray-400 text-sm">
                Create and explore custom AI agents with tailored instructions
                and diverse skills.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                className={cn(
                  buttonVariants({ variant: 'link', size: 'xs' }),
                  'text-official-gray-100 underline',
                )}
                to="/agents"
              >
                View All Agents
              </Link>
              <Link
                className={buttonVariants({ variant: 'outline', size: 'xs' })}
                to="/add-agent"
              >
                Create Agent
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents?.map((agent) => (
              <AgentCard
                agentDescription={agent.ui_description}
                agentId={agent.agent_id}
                agentName={agent.name}
                key={agent.agent_id}
                onAgentSelected={(agentId) => {
                  chatForm.setValue('agent', agentId);
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default EmptyMessage;

const AgentCard = ({
  agentId,
  agentName,
  agentDescription,
  onAgentSelected,
}: {
  agentId: string;
  agentName: string;
  agentDescription: string;
  onAgentSelected: (agentId: string) => void;
}) => {
  return (
    <div className="border-official-gray-850 bg-official-gray-900 flex flex-col items-center justify-between gap-5 rounded-lg border p-4">
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg">
            <AIAgentIcon className="size-4" />
          </div>
          <span className="w-full truncate text-start text-sm">
            {agentName}{' '}
          </span>
        </div>
        <p className="text-official-gray-400 line-clamp-2 min-h-6 text-left text-sm">
          {agentDescription ?? 'No description'}
        </p>
      </div>
      <Button
        className="w-full"
        onClick={() => {
          onAgentSelected(agentId);
        }}
        size="xs"
        variant="outline"
      >
        <CreateAIIcon className="size-4" />
        <span className=""> Chat</span>
      </Button>
    </div>
  );
};
