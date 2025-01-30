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
import { useSendMessageToInbox } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMesssageToInbox/useSendMessageToInbox';
import { Models } from '@shinkai_network/shinkai-node-state/lib/utils/models';
import { DEFAULT_CHAT_CONFIG } from '@shinkai_network/shinkai-node-state/v2/constants';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/v2/mutations/sendMessageToJob/useSendMessageToJob';
import { useStopGeneratingLLM } from '@shinkai_network/shinkai-node-state/v2/mutations/stopGeneratingLLM/useStopGeneratingLLM';
import { useGetAgents } from '@shinkai_network/shinkai-node-state/v2/queries/getAgents/useGetAgents';
import { useGetChatConfig } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConfig/useGetChatConfig';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import { useGetSearchTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsSearch/useGetToolsSearch';
import {
  Button,
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
  fileIconMap,
  FileTypeIcon,
  SendIcon,
  ToolsIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { formatText, getFileExt } from '@shinkai_network/shinkai-ui/helpers';
import { useDebounce } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import equal from 'fast-deep-equal';
import { partial } from 'filesize';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Paperclip, X, XIcon } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';
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

const useSelectedFilesChat = ({ inboxId }: { inboxId?: string }) => {
  const selectedFileKeysRef = useSetJobScope(
    (state) => state.selectedFileKeysRef,
  );
  const selectedFolderKeysRef = useSetJobScope(
    (state) => state.selectedFolderKeysRef,
  );
  const onSelectedKeysChange = useSetJobScope(
    (state) => state.onSelectedKeysChange,
  );

  const location = useLocation();
  const locationState = location.state as ChatConversationLocationState;

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
  return {
    selectedFileKeysRef,
    selectedFolderKeysRef,
    clearSelectedFiles: () => {
      onSelectedKeysChange(null);
      selectedFileKeysRef.clear();
      selectedFolderKeysRef.clear();
    },
  };
};

const SUGGESTED_TOOLS_COUNT = 3;

function ConversationChatFooter({
  inboxId,
  isLoadingMessage,
}: {
  inboxId: string;
  isLoadingMessage: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const auth = useAuth((state) => state.auth);
  const { captureAnalyticEvent } = useAnalytics();

  const { selectedFileKeysRef, selectedFolderKeysRef, clearSelectedFiles } =
    useSelectedFilesChat({
      inboxId,
    });

  const promptSelected = usePromptSelectionStore(
    (state) => state.promptSelected,
  );

  const location = useLocation();

  const locationState = location.state as ChatConversationLocationState;

  const chatForm = useForm<ChatMessageFormSchema>({
    resolver: zodResolver(chatMessageFormSchema),
    defaultValues: {
      message: '',
      files: [],
      agent: '',
    },
  });

  const defaulAgentId = useSettings((state) => state.defaultAgentId);

  useEffect(() => {
    chatForm.reset();
  }, [chatForm, inboxId]);

  useEffect(() => {
    if (!defaulAgentId || inboxId) return;
    chatForm.setValue('agent', defaulAgentId);
  }, [chatForm, defaulAgentId, inboxId]);

  const selectedTool = chatForm.watch('tool');
  const currentMessage = chatForm.watch('message');
  const currentFiles = chatForm.watch('files');
  const currentAI = chatForm.watch('agent');

  const { data: chatConfig } = useGetChatConfig(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      jobId: inboxId ? extractJobIdFromInbox(inboxId) : '',
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
  }, [chatForm, locationState]);

  const currentInbox = useGetCurrentInbox(inboxId);

  const isAgentInbox =
    currentInbox?.agent?.type === 'Agent' || locationState?.agentName;

  const hasProviderEnableStreaming = streamingSupportedModels.includes(
    currentInbox?.agent?.model.split(':')?.[0] as Models,
  );

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
        select: (data) =>
          data.slice(0, SUGGESTED_TOOLS_COUNT).filter((item) => item.enabled),
      },
    );

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
        args: Object.keys(selectedTool.input_args.properties ?? {}),
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
  const { data: agents } = useGetAgents({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  // For switching AIs
  useHotkeys(
    ['mod+[', 'mod+]', 'ctrl+[', 'ctrl+]'],
    (event) => {
      if (inboxId) return; // switch for only empty chat for now
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

  const onSubmit = async (data: ChatMessageFormSchema) => {
    if (!auth || data.message.trim() === '') return;
    if (!inboxId && data.agent) {
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
    if (inboxId) return;
    chatConfigForm.setValue(
      'useTools',
      promptSelected?.useTools ? true : DEFAULT_CHAT_CONFIG.use_tools,
    );
  }, [chatConfigForm, chatForm, promptSelected, inboxId]);

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

  return (
    <div
      {...getRootFileProps({
        className: 'relative shrink-0 p-2 pb-3',
      })}
    >
      <StopGeneratingButton
        shouldStopGenerating={
          hasProviderEnableStreaming && isLoadingMessage && !!inboxId
        }
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
                      {inboxId ? (
                        <AiUpdateSelectionActionBar />
                      ) : (
                        <AIModelSelector
                          onValueChange={(value) => {
                            chatForm.setValue('agent', value);
                          }}
                          value={currentAI ?? ''}
                        />
                      )}
                      <FileSelectionActionBar
                        inputProps={{
                          ...chatForm.register('files'),
                          ...getInputFileProps(),
                        }}
                        onClick={openFilePicker}
                      />
                      <PromptSelectionActionBar />
                      {isAgentInbox ? null : inboxId ? (
                        <UpdateToolsSwitchActionBar />
                      ) : (
                        <ToolsSwitchActionBar
                          checked={chatConfigForm.watch('useTools')}
                          onCheckedChange={(checked) => {
                            chatConfigForm.setValue('useTools', checked);
                          }}
                        />
                      )}
                    </div>

                    {isAgentInbox ? null : inboxId ? (
                      <UpdateChatConfigActionBar />
                    ) : (
                      <CreateChatConfigActionBar form={chatConfigForm} />
                    )}
                  </div>

                  <Popover onOpenChange={setIsCommandOpen} open={isCommandOpen}>
                    <PopoverTrigger asChild>
                      <ChatInputArea
                        autoFocus
                        bottomAddons={
                          <div className="relative z-50 flex items-end gap-3 self-end">
                            {!debounceMessage && (
                              <span className="pb-1 text-xs font-light text-gray-100">
                                <span className="font-medium">Enter</span> to
                                send
                              </span>
                            )}
                            <Button
                              className={cn(
                                'hover:bg-app-gradient h-[40px] w-[40px] cursor-pointer rounded-xl bg-gray-500 p-3 transition-colors',
                                'disabled:text-gray-80 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border disabled:border-gray-200 disabled:bg-gray-300 hover:disabled:bg-gray-300',
                              )}
                              disabled={isLoadingMessage || !currentMessage}
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
                        disabled={isLoadingMessage || isPending}
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
                      className="w-[500px] bg-gray-300 p-0"
                    >
                      <Command>
                        <CommandInput placeholder="Search tools..." />
                        <CommandList>
                          <CommandEmpty>No tools found.</CommandEmpty>
                          <CommandGroup heading="Your ActiveTools">
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
                                    chatConfigForm.setValue('useTools', true);
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
                        searchToolList?.map((tool, idx) => (
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

                                <br />
                                <div className="flex items-center justify-end gap-2 text-xs text-gray-100">
                                  <CommandShortcut>
                                    ⌘ + {idx + 1}
                                  </CommandShortcut>
                                </div>
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

export default memo(
  ConversationChatFooter,
  (prev, next) =>
    prev.inboxId === next.inboxId &&
    prev.isLoadingMessage === next.isLoadingMessage,
);

function StopGeneratingButtonBase({
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
const StopGeneratingButton = memo(StopGeneratingButtonBase);

type FileListProps = {
  currentFiles: File[];
  onRemoveFile: (index: number) => void;
  isPending?: boolean;
};

// TODO: unify with file-preview.tsx
const FileListBase = ({
  currentFiles,
  onRemoveFile,
  isPending,
}: FileListProps) => {
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
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-100" />
              ) : getFileExt(file.name) &&
                fileIconMap[getFileExt(file.name)] ? (
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
const FileList = memo(FileListBase, (prevProps, nextProps) => {
  if (!equal(prevProps.currentFiles, nextProps.currentFiles)) return false;
  if (prevProps.isPending !== nextProps.isPending) return false;
  return true;
});

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
            <span className="text-xs text-gray-100">{description}</span>
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
