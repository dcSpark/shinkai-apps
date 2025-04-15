import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  buildInboxIdFromJobId,
  extractJobIdFromInbox,
} from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import {
  DEFAULT_CHAT_CONFIG,
  FunctionKeyV2,
} from '@shinkai_network/shinkai-node-state/v2/constants';
import { useCreateAgent } from '@shinkai_network/shinkai-node-state/v2/mutations/createAgent/useCreateAgent';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob';
import { useCreateRecurringTask } from '@shinkai_network/shinkai-node-state/v2/mutations/createRecurringTask/useCreateRecurringTask';
import { useRemoveRecurringTask } from '@shinkai_network/shinkai-node-state/v2/mutations/removeRecurringTask/useRemoveRecurringTask';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/v2/mutations/sendMessageToJob/useSendMessageToJob';
import { useUpdateAgent } from '@shinkai_network/shinkai-node-state/v2/mutations/updateAgent/useUpdateAgent';
import { useGetAgent } from '@shinkai_network/shinkai-node-state/v2/queries/getAgent/useGetAgent';
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import { useGetSearchTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsSearch/useGetToolsSearch';
import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Slider,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  TextField,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  FilesIcon,
  ScheduledTasksIcon,
  SendIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { useDebounce } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { useQueryClient } from '@tanstack/react-query';
import cronstrue from 'cronstrue';
import {
  BoltIcon,
  ChevronRight,
  LucideArrowLeft,
  MessageSquare,
  RefreshCwIcon,
  SearchIcon,
  Trash2,
  XIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, To, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { merge } from 'ts-deepmerge';
import { z } from 'zod';

import { useSetJobScope } from '../../components/chat/context/set-job-scope-context';
import { useChatConversationWithOptimisticUpdates } from '../../pages/chat/chat-conversation';
import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';
import { AIModelSelector } from '../chat/chat-action-bar/ai-update-selection-action-bar';
import { MessageList } from '../chat/components/message-list';
import { ChatProvider } from '../chat/context/chat-context';
import { useWebSocketMessage } from '../chat/websocket-message';

const agentFormSchema = z.object({
  name: z.string(),
  llmProviderId: z.string(),
  uiDescription: z.string(),
  storage_path: z.string(),
  knowledge: z.array(z.string()),
  tools: z.array(z.string()),
  debugMode: z.boolean(),
  config: z
    .object({
      custom_prompt: z.string(),
      custom_system_prompt: z.string(),
      temperature: z.number(),
      top_k: z.number(),
      top_p: z.number(),
      use_tools: z.boolean(),
      stream: z.boolean(),
      other_model_params: z.record(z.string()),
    })
    .nullable(),
  scope: z
    .object({
      vector_fs_items: z.array(z.string()),
      vector_fs_folders: z.array(z.string()),
      vector_search_mode: z.string(),
    })
    .optional(),
  cronExpression: z.string().optional(),
  aiPrompt: z.string().optional(),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

interface AgentFormProps {
  mode: 'add' | 'edit';
}

const TabNavigation = () => {
  return (
    <TabsList className="border-official-gray-780 flex h-auto justify-start gap-4 rounded-full bg-transparent px-0.5 py-1">
      <TabsTrigger
        className="data-[state=active]:bg-official-gray-850 text-official-gray-400 border-gray-780 h-full gap-2 rounded-full border bg-transparent px-4 py-2 text-xs font-medium data-[state=active]:text-white"
        value="persona"
      >
        <Badge className="bg-official-gray-700 inline-flex size-5 items-center justify-center rounded-full border-none border-gray-200 p-0 text-center text-[10px] text-gray-50">
          1
        </Badge>
        <span>Persona</span>
      </TabsTrigger>
      <TabsTrigger
        className="data-[state=active]:bg-official-gray-850 text-official-gray-400 border-gray-780 h-full gap-2 rounded-full border bg-transparent px-4 py-2 text-xs font-medium data-[state=active]:text-white"
        value="knowledge"
      >
        <Badge className="bg-official-gray-700 inline-flex size-5 items-center justify-center rounded-full border-none border-gray-200 p-0 text-center text-[10px] text-gray-50">
          2
        </Badge>
        <span>Knowledge</span>
      </TabsTrigger>
      <TabsTrigger
        className="data-[state=active]:bg-official-gray-850 text-official-gray-400 border-gray-780 h-full gap-2 rounded-full border bg-transparent px-4 py-2 text-xs font-medium data-[state=active]:text-white"
        value="tools"
      >
        <Badge className="bg-official-gray-700 inline-flex size-5 items-center justify-center rounded-full border-none border-gray-200 p-0 text-center text-[10px] text-gray-50">
          3
        </Badge>
        <span>Tools</span>
      </TabsTrigger>
      <TabsTrigger
        className="data-[state=active]:bg-official-gray-850 text-official-gray-400 border-gray-780 h-full gap-2 rounded-full border bg-transparent px-4 py-2 text-xs font-medium data-[state=active]:text-white"
        value="schedule"
      >
        <Badge className="bg-official-gray-700 inline-flex size-5 items-center justify-center rounded-full border-none border-gray-200 p-0 text-center text-[10px] text-gray-50">
          4
        </Badge>
        <span>Schedule</span>
      </TabsTrigger>
    </TabsList>
  );
};

function AgentSideChat({ agentId, onClose }: { agentId: string; onClose: () => void }) {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const [chatInboxId, setChatInboxId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  
  const { data: sideAgentData } = useGetAgent({
    agentId,
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const hasTools = useMemo(() => {
    return !!sideAgentData?.tools && sideAgentData.tools.length > 0;
  }, [sideAgentData]);
  
  useWebSocketMessage({
    inboxId: chatInboxId ?? '',
    enabled: !!chatInboxId,
  });
  
  const { mutateAsync: createJob } = useCreateJob({
    onSuccess: (data) => {
      setChatInboxId(buildInboxIdFromJobId(data.jobId));
    },
  });
  
  const { mutateAsync: sendMessageToJob } = useSendMessageToJob({});
  
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
  
  const isLoadingMessage = useMemo(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    return (
      !!chatInboxId &&
      lastMessage?.role === 'assistant' &&
      lastMessage?.status.type === 'running'
    );
  }, [data?.pages, chatInboxId]);
  
  const handleSendMessage = async () => {
    if (!auth || !message.trim()) return;
    
    if (!chatInboxId) {
      await createJob({
        nodeAddress: auth.node_address,
        token: auth.api_v2_key,
        llmProvider: agentId,
        content: message,
        isHidden: false,
        chatConfig: {
          stream: DEFAULT_CHAT_CONFIG.stream,
          custom_prompt: '',
          temperature: DEFAULT_CHAT_CONFIG.temperature,
          top_p: DEFAULT_CHAT_CONFIG.top_p,
          top_k: DEFAULT_CHAT_CONFIG.top_k,
          use_tools: hasTools,
        },
      });
    } else {
      await sendMessageToJob({
        nodeAddress: auth.node_address,
        token: auth.api_v2_key,
        jobId: extractJobIdFromInbox(chatInboxId),
        message: message,
        parent: '',
      });
    }
    
    setMessage('');
  };
  
  return (
    <ChatProvider>
      <div className="h-full bg-official-gray-950 shadow-lg">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-800 p-4">
            <h2 className="text-lg font-medium">Ask Your Agent</h2>
            <div className="flex items-center gap-2">
              <Button onClick={() => setChatInboxId(null)} size="icon" title="Reset Chat" variant="ghost">
                <RefreshCwIcon className="h-5 w-5" />
              </Button>
              <Button onClick={onClose} size="icon" variant="ghost">
                <XIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {!chatInboxId ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <span aria-hidden className="text-4xl">
                  🤖
                </span>
                <h2 className="text-base font-medium">
                  Chat with your Agent
                </h2>
                <p className="text-gray-400 text-xs">
                  Send a message to start chatting with this agent
                </p>
              </div>
            ) : (
              <MessageList
                containerClassName="px-2"
                disabledRetryAndEdit={true}
                fetchPreviousPage={fetchPreviousPage}
                hasPreviousPage={hasPreviousPage}
                isFetchingPreviousPage={isFetchingPreviousPage}
                isLoading={isChatConversationLoading}
                isSuccess={isChatConversationSuccess}
                noMoreMessageLabel={t('chat.allMessagesLoaded')}
                paginatedMessages={data}
              />
            )}
          </div>
          
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center gap-2">
              <Input
                className="placeholder-gray-80 !h-[50px] flex-1 bg-official-gray-900 px-3 py-2"
                disabled={isLoadingMessage}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask your agent..."
                value={message}
              />
              <Button
                className="aspect-square h-[90%] shrink-0 rounded-lg p-2"
                disabled={isLoadingMessage || !message.trim()}
                onClick={handleSendMessage}
                size="auto"
                type="button"
                variant="default"
              >
                <SendIcon className="h-4.5 w-4.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ChatProvider>
  );
}

function AgentForm({ mode }: AgentFormProps) {
  const { agentId } = useParams();

  const defaultAgentId = useSettings((state) => state.defaultAgentId);
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState<
    'persona' | 'knowledge' | 'tools' | 'schedule'
  >('persona');
  
  const [isSideChatOpen, setIsSideChatOpen] = useState(false);

  const [scheduleType, setScheduleType] = useState<'normal' | 'scheduled'>(
    'normal',
  );

  const setSetJobScopeOpen = useSetJobScope(
    (state) => state.setSetJobScopeOpen,
  );

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 600);
  const isSearchQuerySynced = searchQuery === debouncedSearchQuery;

  const { data: searchToolList, isLoading: isSearchToolListPending } =
    useGetSearchTools(
      {
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        search: debouncedSearchQuery,
      },
      { enabled: isSearchQuerySynced && !!searchQuery },
    );

  const selectedKeys = useSetJobScope((state) => state.selectedKeys);
  const selectedFileKeysRef = useSetJobScope(
    (state) => state.selectedFileKeysRef,
  );
  const selectedFolderKeysRef = useSetJobScope(
    (state) => state.selectedFolderKeysRef,
  );
  const onSelectedKeysChange = useSetJobScope(
    (state) => state.onSelectedKeysChange,
  );

  const { data: agent } = useGetAgent({
    agentId: agentId ?? '',
    token: auth?.api_v2_key ?? '',
    nodeAddress: auth?.node_address ?? '',
  });

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: '',
      uiDescription: '',
      storage_path: '',
      knowledge: [],
      tools: [],
      debugMode: false,
      config: {
        stream: DEFAULT_CHAT_CONFIG.stream,
        temperature: DEFAULT_CHAT_CONFIG.temperature,
        top_p: DEFAULT_CHAT_CONFIG.top_p,
        top_k: DEFAULT_CHAT_CONFIG.top_k,
        custom_prompt: '',
        custom_system_prompt: '',
        other_model_params: {},
        use_tools: true,
      },
      llmProviderId: defaultAgentId,
      scope: {
        vector_fs_items: [],
        vector_fs_folders: [],
        vector_search_mode: 'FillUpTo25k',
      },
      cronExpression: '',
      aiPrompt: '',
    },
  });

  // Effect to update form when selected items change
  useEffect(() => {
    if (
      selectedKeys ||
      selectedFileKeysRef.size > 0 ||
      selectedFolderKeysRef.size > 0
    ) {
      const agentData = {
        ...form.getValues(),
        scope: {
          vector_fs_items: Array.from(selectedFileKeysRef.values()),
          vector_fs_folders: Array.from(selectedFolderKeysRef.values()),
          vector_search_mode: 'FillUpTo25k',
        },
      };
      form.setValue('scope', agentData.scope);
    }
  }, [selectedKeys, selectedFileKeysRef, selectedFolderKeysRef, form]);

  // Effect to handle drawer close
  useEffect(() => {
    if (!setSetJobScopeOpen) {
      const scope = {
        vector_fs_items: Array.from(selectedFileKeysRef.values()),
        vector_fs_folders: Array.from(selectedFolderKeysRef.values()),
        vector_search_mode: 'FillUpTo25k',
      };
      form.setValue('scope', scope);
    }
  }, [setSetJobScopeOpen, selectedFileKeysRef, selectedFolderKeysRef, form]);

  // Effect to handle initial agent data and schedule type
  useEffect(() => {
    if (mode === 'edit' && agent) {
      form.setValue('name', agent.name);
      form.setValue('uiDescription', agent.ui_description);
      form.setValue('storage_path', agent.storage_path);
      form.setValue('knowledge', agent.knowledge);
      form.setValue('tools', agent.tools);
      form.setValue('debugMode', agent.debug_mode);
      form.setValue('config', {
        custom_prompt: agent.config?.custom_prompt ?? '',
        custom_system_prompt: agent.config?.custom_system_prompt ?? '',
        temperature:
          agent.config?.temperature ?? DEFAULT_CHAT_CONFIG.temperature,
        top_k: agent.config?.top_k ?? DEFAULT_CHAT_CONFIG.top_k,
        top_p: agent.config?.top_p ?? DEFAULT_CHAT_CONFIG.top_p,
        use_tools: agent.config?.use_tools ?? true,
        stream: agent.config?.stream ?? DEFAULT_CHAT_CONFIG.stream,
        other_model_params: agent.config?.other_model_params ?? {},
      });
      form.setValue('llmProviderId', agent.llm_provider_id);

      // Set schedule type and cron expression based on existing tasks
      if (agent.cron_tasks && agent.cron_tasks.length > 0) {
        setScheduleType('scheduled');
        // Assuming only one cron task per agent for this form
        form.setValue('cronExpression', agent.cron_tasks[0]?.cron ?? ''); 
        
        if (agent.cron_tasks[0]?.action && 'CreateJobWithConfigAndMessage' in agent.cron_tasks[0].action) {
          form.setValue('aiPrompt', agent.cron_tasks[0].action.CreateJobWithConfigAndMessage.message.content ?? '');
        }
      } else {
        setScheduleType('normal');
        form.setValue('cronExpression', '');
        form.setValue('aiPrompt', '');
      }

      // Set selected files and folders
      if (
        agent.scope?.vector_fs_items?.length ||
        agent.scope?.vector_fs_folders?.length
      ) {
        const selectedVRFilesPathMap = agent.scope.vector_fs_items.reduce<
          Record<string, { checked: boolean }>
        >((acc: Record<string, { checked: boolean }>, filePath: string) => {
          acc[filePath] = {
            checked: true,
          };
          return acc;
        }, {});

        const selectedVRFoldersPathMap = agent.scope.vector_fs_folders.reduce<
          Record<string, { checked: boolean }>
        >((acc: Record<string, { checked: boolean }>, folderPath: string) => {
          acc[folderPath] = {
            checked: true,
          };
          return acc;
        }, {});

        onSelectedKeysChange({
          ...selectedVRFilesPathMap,
          ...selectedVRFoldersPathMap,
        });

        form.setValue('scope', {
          vector_fs_items: agent.scope.vector_fs_items,
          vector_fs_folders: agent.scope.vector_fs_folders,
          vector_search_mode: agent.scope.vector_search_mode || 'FillUpTo25k',
        });
      }
    }
  }, [agent, form, mode, onSelectedKeysChange]);

  useEffect(() => {
    if (mode === 'edit') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('openChat') === 'true') {
        setIsSideChatOpen(true);
      }
    }
  }, [mode]);

  // Effect to handle drawer open/close
  useEffect(() => {
    const scope = form.getValues('scope');
    if (scope) {
      form.setValue('scope', {
        ...scope,
        vector_fs_items: Array.from(selectedFileKeysRef.values()),
        vector_fs_folders: Array.from(selectedFolderKeysRef.values()),
      });
    }
  }, [form, selectedFileKeysRef, selectedFolderKeysRef]);

  const { data: toolsList } = useGetTools({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const { mutateAsync: createAgent, isPending: isCreating } = useCreateAgent({
    onError: (error) => {
      toast.error('Failed to create agent', {
        description: error.response?.data?.message ?? error.message,
      });
    },
  });

  const { mutateAsync: updateAgent, isPending: isUpdating } = useUpdateAgent({
    onError: (error) => {
      toast.error('Failed to update agent core data', {
        description: error.response?.data?.message ?? error.message,
      });
    },
  });
  
  // Create a separate mutation for quick save without navigation
  const { mutateAsync: quickSaveAgentMutation, isPending: isQuickSavePending } = useUpdateAgent({
    onError: (error) => {
      toast.error('Failed to update agent', {
        description: error.response?.data?.message ?? error.message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          FunctionKeyV2.GET_AGENT,
          {
            agentId: agent?.agent_id,
            nodeAddress: auth?.node_address ?? '',
          },
        ],
      });
      toast.success('Agent updated successfully');
    },
  });
  
  const quickSaveAgent = async () => {
    if (!agent || !auth) return;

    try {
      const values = form.getValues();
      // Calculate cron validity for quick save
      const currentCronExpressionValue = values.cronExpression;
      let isCronValidForQuickSave = false;
      if (scheduleType === 'scheduled' && currentCronExpressionValue) {
        try {
          const readable = cronstrue.toString(currentCronExpressionValue, { throwExceptionOnParseError: true });
          isCronValidForQuickSave = !readable.toLowerCase().includes('error');
        } catch (e) {
          isCronValidForQuickSave = false;
        }
      } else if (scheduleType === 'normal') {
         isCronValidForQuickSave = true; // It's valid to save in normal mode
      }

      const agentData = {
        agent_id: agent.agent_id,
        full_identity_name: agent.full_identity_name,
        llm_provider_id: values.llmProviderId,
        ui_description: values.uiDescription,
        storage_path: values.storage_path,
        knowledge: values.knowledge,
        tools: values.tools,
        debug_mode: values.debugMode,
        config: values.config,
        name: values.name,
        scope: {
          vector_fs_items: Array.from(selectedFileKeysRef.values()),
          vector_fs_folders: Array.from(selectedFolderKeysRef.values()),
          vector_search_mode: 'FillUpTo25k',
        },
      };

      // Call the update mutation WITHOUT cronExpression
      await quickSaveAgentMutation({
        nodeAddress: auth.node_address,
        token: auth.api_v2_key,
        agent: agentData,
      });

      const existingTask = agent.cron_tasks?.[0];
      const desiredCron = scheduleType === 'scheduled' ? values.cronExpression : undefined;

      if (desiredCron && isCronValidForQuickSave) {
        if (!existingTask) {
          await createTask({
            nodeAddress: auth.node_address,
            token: auth.api_v2_key,
            name: agent.agent_id,
            description: values.uiDescription || agent.agent_id,
            llmProvider: agent.agent_id,
            cronExpression: desiredCron,
            chatConfig: {
                custom_prompt: values.config?.custom_prompt ?? '',
                temperature: values.config?.temperature,
                top_p: values.config?.top_p,
                top_k: values.config?.top_k,
                use_tools: values.tools.length > 0,
                stream: true,
            },
            message: values.aiPrompt || values.uiDescription || 'Scheduled run',
            toolKey: '',
          });
        } else if (existingTask.cron !== desiredCron) {
           // Use correct parameters for removeTask
           await removeTask({ 
             nodeAddress: auth.node_address,
             token: auth.api_v2_key,
             recurringTaskId: existingTask.task_id.toString() 
           });
           await createTask({
            nodeAddress: auth.node_address,
            token: auth.api_v2_key,
            name: agent.agent_id,
            description: values.uiDescription || agent.agent_id,
            llmProvider: agent.agent_id,
            cronExpression: desiredCron,
            chatConfig: {
                custom_prompt: values.config?.custom_prompt ?? '',
                temperature: values.config?.temperature,
                top_p: values.config?.top_p,
                top_k: values.config?.top_k,
                use_tools: values.tools.length > 0,
                stream: true,
            },
            message: values.aiPrompt || values.uiDescription || 'Scheduled run',
            toolKey: '',
           });
        }
      } else if (!desiredCron && existingTask) {
         // Use correct parameters for removeTask
         await removeTask({ 
           nodeAddress: auth.node_address,
           token: auth.api_v2_key,
           recurringTaskId: existingTask.task_id.toString() 
         });
      } else if (desiredCron && !isCronValidForQuickSave) {
          // toast.error("Invalid Cron Expression. Quick save did not update schedule.");
      }
      // --- End Cron Handling ---

    } catch (error: any) {
      console.error("Quick save error:", error);
      if (!error.response?.data?.message) {
         toast.error('Failed to quick save agent schedule', {
            description: error.message || 'An unexpected error occurred.',
         });
      }
    }
  };

  const queryClient = useQueryClient();

  const { mutateAsync: removeTask, isPending: isRemovingTask } =
    useRemoveRecurringTask({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            FunctionKeyV2.GET_AGENT,
            {
              agentId: agent?.agent_id,
              nodeAddress: auth?.node_address ?? '',
            },
          ],
        });
        // Clear cron expression in form after successful deletion
        form.setValue('cronExpression', '');
        setScheduleType('normal');
        toast.success('Delete task successfully');
      },
      onError: (error) => {
        toast.error('Failed remove task', {
          description: error.response?.data?.message ?? error.message,
        });
      },
    });

  const onDeleteTask = async (taskId: string) => {
    await removeTask({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      recurringTaskId: taskId,
    });
  };

  const { mutateAsync: createTask, isPending: isCreatingTask } = 
    useCreateRecurringTask({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            FunctionKeyV2.GET_AGENT,
            {
              agentId: agentId ?? form.getValues('name').replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase(), 
              nodeAddress: auth?.node_address ?? '',
            },
          ],
        });
        toast.success('Scheduled task created successfully');
      },
      onError: (error) => {
        toast.error('Failed to create scheduled task', {
          description: error.response?.data?.message ?? error.message,
        });
      },
    });

 const submit = async (values: AgentFormValues, options?: { openChat?: boolean }) => {
    if (!auth) {
       toast.error("Authentication details are missing.");
       return;
    }

    // Use memoized readableCronExpression for validation
    if (scheduleType === 'scheduled' && (!values.cronExpression || !readableCronExpression)) {
       toast.error("Invalid or empty Cron Expression. Cannot save.");
       setCurrentTab('schedule');
       return;
    }

    const agentIdToUse = mode === 'edit' && agent ? agent.agent_id : values.name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    const agentData = {
      agent_id: agentIdToUse,
      full_identity_name: `${auth.shinkai_identity}/main/agent/${agentIdToUse}`,
      llm_provider_id: values.llmProviderId,
      ui_description: values.uiDescription,
      storage_path: values.storage_path,
      knowledge: values.knowledge,
      tools: values.tools,
      debug_mode: values.debugMode,
      config: values.config,
      name: values.name,
      scope: {
        vector_fs_items: Array.from(selectedFileKeysRef.values()),
        vector_fs_folders: Array.from(selectedFolderKeysRef.values()),
        vector_search_mode: 'FillUpTo25k',
      },
    };

    try {
      if (mode === 'edit' && agent) {
        // Step 1: Update Agent Core Data
        await updateAgent({
          nodeAddress: auth.node_address,
          token: auth.api_v2_key,
          agent: merge(agentData, {
            agent_id: agent.agent_id,
            full_identity_name: agent.full_identity_name
          }),
        });

        // Step 2: Handle Cron Task Logic (Create/Update/Delete)
        const existingTask = agent.cron_tasks?.[0];
        const desiredCron = scheduleType === 'scheduled' ? values.cronExpression : undefined;

        if (desiredCron) { // User wants a schedule
          if (!existingTask) { // No existing task -> Create
             await createTask({
               nodeAddress: auth.node_address,
               token: auth.api_v2_key,
               name: agent.agent_id,
               description: values.uiDescription || agent.agent_id,
               llmProvider: agent.agent_id,
               cronExpression: desiredCron,
               chatConfig: {
                   custom_prompt: values.config?.custom_prompt ?? '',
                   temperature: values.config?.temperature,
                   top_p: values.config?.top_p,
                   top_k: values.config?.top_k,
                   use_tools: values.tools.length > 0,
                   stream: true,
               },
               message: values.aiPrompt || values.uiDescription || 'Scheduled run',
               toolKey: '',
             });
          } else if (existingTask.cron !== desiredCron) { // Existing task, cron changed -> Remove + Create
             await removeTask({ 
               nodeAddress: auth.node_address,
               token: auth.api_v2_key,
               recurringTaskId: existingTask.task_id.toString() 
             });
             await createTask({
               nodeAddress: auth.node_address,
               token: auth.api_v2_key,
               name: agent.agent_id,
               description: values.uiDescription || agent.agent_id,
               llmProvider: agent.agent_id,
               cronExpression: desiredCron,
               chatConfig: {
                   custom_prompt: values.config?.custom_prompt ?? '',
                   temperature: values.config?.temperature,
                   top_p: values.config?.top_p,
                   top_k: values.config?.top_k,
                   use_tools: values.tools.length > 0,
                   stream: true,
               },
               message: values.aiPrompt || values.uiDescription || 'Scheduled run',
               toolKey: '',
             });
          }
          // If desiredCron and existingTask.cron are the same, do nothing to the task
        } else if (!desiredCron && existingTask) { // User wants 'normal' mode, but task exists -> Remove
           await removeTask({ 
             nodeAddress: auth.node_address,
             token: auth.api_v2_key,
             recurringTaskId: existingTask.task_id.toString() 
           });
        }
        
        // --- End Cron Handling ---

        // Step 3: Show success and navigate ONLY if all above steps succeeded
        toast.success("Agent updated successfully!");
        navigate('/agents');

      } else { // --- Create New Agent ---
        const cronToPass = scheduleType === 'scheduled' ? values.cronExpression : undefined;
        await createAgent({ // createAgent handles cron internally
          nodeAddress: auth.node_address,
          token: auth.api_v2_key,
          agent: agentData,
          cronExpression: cronToPass,
        });

        // Show success and navigate after creation succeeds
        toast.success("Agent created successfully!");
        if (options?.openChat) {
          navigate(`/agents/edit/${agentIdToUse}?openChat=true`);
        } else {
           navigate('/agents');
        }
      }
    } catch (error: any) { // Catch errors from ANY await above
      console.error("Submit error:", error);
      // Avoid redundant toasts if mutation's onError already fired
      if (!error.response?.data?.message) {
         // Provide a generic error if the specific mutation didn't toast
         toast.error('Failed to save agent settings', {
            description: error.message || 'An unexpected error occurred.',
         });
      }
      // Do NOT navigate on error
    }
  };

  const isPending = mode === 'edit' ? (isUpdating || isCreatingTask || isRemovingTask) : (isCreating || isCreatingTask);

  const currentCronExpression = form.watch('cronExpression');

  const readableCronExpression = useMemo(() => {
    if (!currentCronExpression) {
      return null;
    }
    try {
      const readableCron = cronstrue.toString(currentCronExpression, {
        throwExceptionOnParseError: true, // Ensure errors are caught
      });
      // Check for error strings just in case throwException doesn't catch everything
       if (readableCron.toLowerCase().includes('error')) {
         return null;
       }
      return readableCron;
    } catch (e) {
       return null; // Invalid cron expression
    }
  }, [currentCronExpression]);

  return (
    <ResizablePanelGroup className="relative h-full min-h-0" direction="horizontal">
      <ResizablePanel className="flex min-h-0 h-full flex-1" defaultSize={70} minSize={50}>
        <div className="container flex h-full min-h-0 max-w-3xl flex-col">
          <div className="flex items-center justify-between pb-6 pt-10">
            <div className="flex items-center gap-5">
              <Link to={-1 as To}>
                <LucideArrowLeft />
                <span className="sr-only">{t('common.back')}</span>
              </Link>
              <h1 className="font-clash text-2xl font-medium">
                {mode === 'edit' ? 'Update Agent' : 'Create New Agent'}
              </h1>
            </div>
            {mode === 'edit' && agent && (
              <div className="flex gap-2">
                <Button
                  className="flex items-center gap-2"
                  isLoading={isQuickSavePending}
                  onClick={quickSaveAgent}
                  size="sm"
                  variant="outline"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Save
                </Button>
                <Button
                  className="flex items-center gap-2"
                  onClick={() => setIsSideChatOpen(!isSideChatOpen)}
                  size="sm"
                  variant="outline"
                >
                  <MessageSquare className="h-4 w-4" />
                  {isSideChatOpen ? 'Close Chat' : 'Open Chat'}
                </Button>
              </div>
            )}
          </div>

          <Form {...form}>
            <form
              className="flex w-full flex-1 min-h-0 flex-col justify-between space-y-2"
              // Pass values directly, options are handled inside submit
              onSubmit={form.handleSubmit(values => submit(values))} 
            >
            <div className="mx-auto w-full flex-1 min-h-0 overflow-hidden">
              <div className="h-full min-h-0 space-y-6 overflow-hidden">
                <Tabs
                  className="flex h-full min-h-0 flex-col gap-4"
                  defaultValue="persona"
                  onValueChange={(value) =>
                    setCurrentTab(value as 'persona' | 'knowledge' | 'tools' | 'schedule')
                  }
                  value={currentTab}
                >
                  <TabNavigation />

                  <TabsContent className="flex-1 min-h-0 overflow-y-auto" value="persona">
                    <div className="h-full min-h-0 space-y-8">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <TextField
                            autoFocus
                            field={{
                              ...field,
                              disabled: mode === 'edit' // Prevent editing name/ID in edit mode
                            }}
                            helperMessage={mode === 'edit' ? "Agent name cannot be changed after creation." : "Enter a unique name for your AI agent (used as ID)."}
                            label="Agent Name"
                          />
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="uiDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel> Description</FormLabel>

                            <FormControl>
                              <Textarea
                                className="!min-h-[100px] text-sm"
                                onChange={field.onChange}
                                placeholder="e.g., Create user-centered designs and improve user interactions."
                                spellCheck={false}
                                value={field.value}
                              />
                            </FormControl>
                            <FormDescription>
                              Briefly describe your agent&apos;s purpose (not used
                              by the agent).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="config.custom_system_prompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                              <Textarea
                                className="placeholder-official-gray-500 !min-h-[300px] text-sm"
                                placeholder="e.g., You are a professional UX expert. Answer questions about UI/UX best practices."
                                spellCheck={false}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Control your agents behavior by adding custom
                              instructions
                            </FormDescription>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="llmProviderId"
                        render={({ field }) => (
                          <div className="space-y-2">
                            <p className="text-official-gray-400 text-sm">
                              {t('chat.form.selectAI')}
                            </p>
                            <span className="text-official-gray-200 text-xs">
                              Choose the model that will power your agent
                            </span>
                            <AIModelSelector
                              className="bg-official-gray-900 !h-auto w-full rounded-lg border !border-gray-200 py-2.5"
                              onValueChange={field.onChange}
                              value={field.value}
                            />
                          </div>
                        )}
                      />

                      <Collapsible>
                        <CollapsibleTrigger
                          className={cn(
                            'text-official-gray-400 hover:text-official-gray-300 flex items-center gap-1 text-sm',
                            '[&[data-state=open]>svg]:rotate-90',
                            '[&[data-state=open]>span.input]:block',
                            '[&[data-state=open]>span.content]:hidden',
                          )}
                        >
                          Advanced Options
                          <ChevronRight className="ml-1 size-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="space-y-4 py-6">
                            <FormField
                              control={form.control}
                              name="config.stream"
                              render={({ field }) => (
                                <FormItem className="flex w-full flex-col gap-3">
                                  <div className="flex justify-between gap-3">
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="static space-y-1.5 text-sm text-white">
                                        Enable Stream
                                      </FormLabel>
                                      <p className="text-official-gray-400 text-xs">
                                        Streams the agent&apos;s response as it
                                        generates.
                                      </p>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </div>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="config.use_tools"
                              render={({ field }) => (
                                <FormItem className="flex w-full flex-col gap-3">
                                  <div className="flex justify-between gap-3">
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="static space-y-1.5 text-sm text-white">
                                        Enable Tools
                                      </FormLabel>
                                      <p className="text-official-gray-400 text-xs">
                                        Allows the agent to use tools to complete
                                        tasks.
                                      </p>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </div>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="config.temperature"
                              render={({ field }) => (
                                <FormItem className="flex gap-2.5">
                                  <FormControl>
                                    <HoverCard openDelay={200}>
                                      <HoverCardTrigger asChild>
                                        <div className="grid w-full gap-4">
                                          <div className="flex items-center justify-between">
                                            <Label htmlFor="temperature">
                                              Temperature
                                            </Label>
                                            <span className="text-official-gray-400 hover:border-border w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm">
                                              {field.value}
                                            </span>
                                          </div>
                                          <Slider
                                            aria-label="Temperature"
                                            className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                                            id="temperature"
                                            max={1}
                                            onValueChange={(vals) => {
                                              field.onChange(vals[0]);
                                            }}
                                            step={0.1}
                                            value={[field.value]}
                                          />
                                        </div>
                                      </HoverCardTrigger>
                                      <HoverCardContent
                                        align="start"
                                        className="w-[260px] bg-gray-600 px-2 py-3 text-xs"
                                        side="left"
                                      >
                                        Temperature is a parameter that affects
                                        the randomness of AI outputs. Higher temp
                                        = more unexpected, lower temp = more
                                        predictable.
                                      </HoverCardContent>
                                    </HoverCard>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="config.top_p"
                              render={({ field }) => (
                                <FormItem className="flex gap-2.5">
                                  <FormControl>
                                    <HoverCard openDelay={200}>
                                      <HoverCardTrigger asChild>
                                        <div className="grid w-full gap-4">
                                          <div className="flex items-center justify-between">
                                            <Label htmlFor="topP">Top P</Label>
                                            <span className="text-official-gray-400 hover:border-border w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm">
                                              {field.value}
                                            </span>
                                          </div>
                                          <Slider
                                            aria-label="Top P"
                                            className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                                            id="topP"
                                            max={1}
                                            min={0}
                                            onValueChange={(vals) => {
                                              field.onChange(vals[0]);
                                            }}
                                            step={0.1}
                                            value={[field.value]}
                                          />
                                        </div>
                                      </HoverCardTrigger>
                                      <HoverCardContent
                                        align="start"
                                        className="w-[260px] bg-gray-600 px-2 py-3 text-xs"
                                        side="left"
                                      >
                                        Adjust the probability threshold to
                                        increase the relevance of results. For
                                        example, a threshold of 0.9 could be
                                        optimal for targeted, specific
                                        applications, whereas a threshold of 0.95
                                        or 0.97 might be preferred for tasks that
                                        require broader, more creative responses.
                                      </HoverCardContent>
                                    </HoverCard>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="config.top_k"
                              render={({ field }) => (
                                <FormItem className="flex gap-2.5">
                                  <FormControl>
                                    <HoverCard openDelay={200}>
                                      <HoverCardTrigger asChild>
                                        <div className="grid w-full gap-4">
                                          <div className="flex items-center justify-between">
                                            <Label htmlFor="topK">Top K</Label>
                                            <span className="text-official-gray-400 hover:border-border w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm">
                                              {field.value}
                                            </span>
                                          </div>
                                          <Slider
                                            aria-label="Top K"
                                            className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                                            id="topK"
                                            max={100}
                                            onValueChange={(vals) => {
                                              field.onChange(vals[0]);
                                            }}
                                            step={1}
                                            value={[field.value]}
                                          />
                                        </div>
                                      </HoverCardTrigger>
                                      <HoverCardContent
                                        align="start"
                                        className="w-[260px] bg-gray-600 px-2 py-3 text-xs"
                                        side="left"
                                      >
                                        Adjust the count of key words for creating
                                        sequences. This parameter governs the
                                        extent of the generated passage,
                                        forestalling too much repetition.
                                        Selecting a higher figure yields longer
                                        narratives, whereas a smaller figure keeps
                                        the text brief.
                                      </HoverCardContent>
                                    </HoverCard>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </TabsContent>

                  <TabsContent className="flex-1 min-h-0 overflow-y-auto" value="knowledge">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h2 className="text-base font-medium">Knowledge Base</h2>
                        <p className="text-official-gray-400 text-sm">
                          Provide your agent with local AI files to enhance its
                          knowledge and capabilities.
                        </p>
                      </div>

                      <Button
                        className={cn(
                          'flex h-auto w-auto items-center gap-2 rounded-lg px-2.5 py-1.5',
                        )}
                        onClick={() => {
                          setSetJobScopeOpen(true);
                        }}
                        size="auto"
                        type="button"
                        variant="outline"
                      >
                        <div className="flex items-center gap-2">
                          {Object.keys(selectedKeys || {}).length > 0 ? (
                            <Badge className="bg-official-gray-1000 inline-flex size-4 items-center justify-center rounded-full border-gray-200 p-0 text-center text-[10px] text-gray-50">
                              {Object.keys(selectedKeys || {}).length}
                            </Badge>
                          ) : (
                            <FilesIcon className="size-4" />
                          )}

                          <p className="text-xs text-white">
                            {t('vectorFs.localFiles')}
                          </p>
                        </div>
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent className="flex-1 min-h-0 overflow-y-auto" value="tools">
                    <div className="h-full min-h-0 space-y-6 overflow-y-auto">
                      <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                          <h2 className="text-base font-medium">Tools</h2>
                          <p className="text-official-gray-400 text-sm">
                            Select which tools &amp; skills your agent can use to
                            complete tasks.
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            navigate('/tools');
                          }}
                          size="xs"
                          variant="outline"
                        >
                          <PlusIcon className="mr-1 size-3.5" />
                          Create New
                        </Button>
                      </div>
                      <div className="relative flex h-10 w-full items-center">
                        <Input
                          className="placeholder-gray-80 !h-full rounded-lg bg-transparent py-2 pl-10"
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                          }}
                          placeholder={t('common.searchPlaceholder')}
                          value={searchQuery}
                        />
                        <SearchIcon className="absolute left-4 top-1/2 -z-[1px] h-4 w-4 -translate-y-1/2" />
                        {searchQuery && (
                          <Button
                            className="hover:bg-official-gray-800 absolute right-1 h-8 w-8 bg-transparent p-2"
                            onClick={() => {
                              setSearchQuery('');
                            }}
                            size="auto"
                            type="button"
                            variant="ghost"
                          >
                            <XIcon />
                            <span className="sr-only">
                              {t('common.clearSearch')}
                            </span>
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-col gap-5 overflow-auto">
                        {(isPending ||
                          !isSearchQuerySynced ||
                          isSearchToolListPending) && (
                          <div className="grid grid-cols-1">
                            {Array.from({ length: 4 }).map((_, idx) => (
                              <div
                                className={cn(
                                  'grid animate-pulse grid-cols-[1fr_40px] items-center justify-between gap-5 rounded-sm py-3 text-left text-sm',
                                )}
                                key={idx}
                              >
                                <div className="flex w-full flex-1 flex-col gap-3">
                                  <span className="h-4 w-36 rounded-sm bg-gray-300" />
                                  <div className="flex flex-col gap-1">
                                    <span className="h-3 w-full rounded-sm bg-gray-300" />
                                    <span className="h-3 w-2/4 rounded-sm bg-gray-300" />
                                  </div>
                                </div>
                                <span className="h-5 w-[36px] rounded-full bg-gray-300" />
                              </div>
                            ))}
                          </div>
                        )}
                        {searchQuery &&
                          isSearchQuerySynced &&
                          searchToolList?.map((tool) => (
                            <FormField
                              control={form.control}
                              key={tool.tool_router_key}
                              name="tools"
                              render={({ field }) => (
                                <FormItem className="flex w-full flex-col gap-3">
                                  <div className="flex items-center gap-3">
                                    <FormControl>
                                      <div className="flex w-full items-start gap-3">
                                        <div className="inline-flex flex-1 items-center gap-2 leading-none">
                                          <label
                                            className="flex flex-col gap-2 text-xs text-gray-50"
                                            htmlFor={tool.tool_router_key}
                                          >
                                            <span className="inline-flex items-center gap-1 text-sm text-white">
                                              {formatText(tool.name)}
                                              {(tool.config ?? []).length > 0 && (
                                                <Tooltip>
                                                  <TooltipTrigger
                                                    asChild
                                                    className="flex shrink-0 items-center gap-1"
                                                  >
                                                    <Link
                                                      className="text-gray-80 size-3.5 rounded-lg hover:text-white"
                                                      to={`/tools/${tool.tool_router_key}`}
                                                    >
                                                      <BoltIcon className="size-full" />
                                                    </Link>
                                                  </TooltipTrigger>
                                                  <TooltipPortal>
                                                    <TooltipContent
                                                      align="center"
                                                      alignOffset={-10}
                                                      className="max-w-md"
                                                      side="top"
                                                    >
                                                      <p>Configure tool</p>
                                                    </TooltipContent>
                                                  </TooltipPortal>
                                                </Tooltip>
                                              )}
                                            </span>
                                            <span className="text-official-gray-400 text-sm">
                                              {tool.description}
                                            </span>
                                          </label>
                                        </div>
                                        <Switch
                                          checked={field.value.includes(
                                            tool.tool_router_key,
                                          )}
                                          className="shrink-0"
                                          id={tool.tool_router_key}
                                          onCheckedChange={() => {
                                            const configs = tool?.config ?? [];
                                            if (
                                              configs
                                                .map((conf) => ({
                                                  key_name:
                                                    conf.BasicConfig.key_name,
                                                  key_value:
                                                    conf.BasicConfig.key_value ??
                                                    '',
                                                  required:
                                                    conf.BasicConfig.required,
                                                }))
                                                .every(
                                                  (conf) =>
                                                    !conf.required ||
                                                    (conf.required &&
                                                      conf.key_value !== ''),
                                                )
                                            ) {
                                              field.onChange(
                                                field.value.includes(
                                                  tool.tool_router_key,
                                                )
                                                  ? field.value.filter(
                                                      (value) =>
                                                        value !==
                                                        tool.tool_router_key,
                                                    )
                                                  : [
                                                      ...field.value,
                                                      tool.tool_router_key,
                                                    ],
                                              );

                                              return;
                                            }
                                            toast.error(
                                              'Tool configuration is required',
                                              {
                                                description:
                                                  'Please fill in the config required in tool details',
                                              },
                                            );
                                          }}
                                        />
                                      </div>
                                    </FormControl>
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))}
                        {isSearchQuerySynced && !searchQuery && (
                          <div className="flex items-center justify-between gap-3">
                            <label className="text-xs text-gray-50" htmlFor="all">
                              Enabled All
                            </label>
                            <Switch
                              checked={
                                (toolsList?.length ?? 0) > 0 && // Only checked if tools exist
                                form.watch('tools').length === toolsList?.length
                              }
                              id="all"
                              onCheckedChange={(checked) => {
                                const isAllConfigFilled = toolsList
                                  ?.map((tool) => tool.config)
                                  .filter((item) => !!item)
                                  .flat()
                                  ?.map((conf) => ({
                                    key_name: conf.BasicConfig.key_name,
                                    key_value: conf.BasicConfig.key_value ?? '',
                                    required: conf.BasicConfig.required,
                                  }))
                                  .every(
                                    (conf) =>
                                      !conf.required ||
                                      (conf.required && conf.key_value !== ''),
                                  );
                                if (!isAllConfigFilled && checked) { // Check config only when enabling all
                                  toast.error('Tool configuration', {
                                    description:
                                      'Please fill in the config required in tool details',
                                  });
                                  return;
                                }
                                if (checked && toolsList) {
                                  form.setValue(
                                    'tools',
                                    toolsList.map((tool) => tool.tool_router_key),
                                  );
                                } else {
                                  form.setValue('tools', []);
                                }
                              }}
                            />
                          </div>
                        )}
                        {!searchQuery &&
                          toolsList?.map((tool) => (
                            <FormField
                              control={form.control}
                              key={tool.tool_router_key}
                              name="tools"
                              render={({ field }) => (
                                <FormItem className="flex w-full flex-col gap-3">
                                  <div className="flex items-center gap-3">
                                    <FormControl>
                                      <div className="flex w-full items-start gap-3">
                                        <div className="inline-flex flex-1 items-center gap-2 leading-none">
                                          <label
                                            className="flex flex-col gap-2 text-xs text-gray-50"
                                            htmlFor={tool.tool_router_key}
                                          >
                                            <span className="inline-flex items-center gap-1 text-sm text-white">
                                              {formatText(tool.name)}
                                              {(tool.config ?? []).length > 0 && (
                                                <Tooltip>
                                                  <TooltipTrigger
                                                    asChild
                                                    className="flex shrink-0 items-center gap-1"
                                                  >
                                                    <Link
                                                      className="text-gray-80 size-3.5 rounded-lg hover:text-white"
                                                      to={`/tools/${tool.tool_router_key}`}
                                                    >
                                                      <BoltIcon className="size-full" />
                                                    </Link>
                                                  </TooltipTrigger>
                                                  <TooltipPortal>
                                                    <TooltipContent
                                                      align="center"
                                                      alignOffset={-10}
                                                      className="max-w-md"
                                                      side="top"
                                                    >
                                                      <p>Configure tool</p>
                                                    </TooltipContent>
                                                  </TooltipPortal>
                                                </Tooltip>
                                              )}
                                            </span>
                                            <span className="text-official-gray-400 text-sm">
                                              {tool.description}
                                            </span>
                                          </label>
                                        </div>
                                        <Switch
                                          checked={field.value.includes(
                                            tool.tool_router_key,
                                          )}
                                          className="shrink-0"
                                          id={tool.tool_router_key}
                                          onCheckedChange={() => {
                                            const configs = tool?.config ?? [];
                                            if (
                                              configs
                                                .map((conf) => ({
                                                  key_name:
                                                    conf.BasicConfig.key_name,
                                                  key_value:
                                                    conf.BasicConfig.key_value ??
                                                    '',
                                                  required:
                                                    conf.BasicConfig.required,
                                                }))
                                                .every(
                                                  (conf) =>
                                                    !conf.required ||
                                                    (conf.required &&
                                                      conf.key_value !== ''),
                                                )
                                            ) {
                                              field.onChange(
                                                field.value.includes(
                                                  tool.tool_router_key,
                                                )
                                                  ? field.value.filter(
                                                      (value) =>
                                                        value !==
                                                        tool.tool_router_key,
                                                    )
                                                  : [
                                                      ...field.value,
                                                      tool.tool_router_key,
                                                    ],
                                              );

                                              return;
                                            }
                                            toast.error(
                                              'Tool configuration is required',
                                              {
                                                description:
                                                  'Please fill in the config required in tool details',
                                              },
                                            );
                                          }}
                                        />
                                      </div>
                                    </FormControl>
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="schedule">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h2 className="text-base font-medium">Schedule</h2>
                        <p className="text-official-gray-400 text-sm">
                          Set when your agent will automatically run tasks.
                        </p>
                      </div>
                      {/* Conditional rendering logic for schedule options */}
                      {/* Only show radio group if mode is 'add' OR if mode is 'edit' AND there are no existing tasks */}
                      {(mode === 'add' || (mode === 'edit' && (!agent?.cron_tasks || agent.cron_tasks.length === 0))) && (
                        <RadioGroup
                          className="space-y-3"
                          onValueChange={(value) => {
                            const newType = value as 'normal' | 'scheduled';
                            setScheduleType(newType);
                            // Clear cronExpression if switching to normal
                            if (newType === 'normal') {
                               form.setValue('cronExpression', '');
                            }
                          }}
                          value={scheduleType}
                        >
                          <div className="flex items-start space-x-3 rounded-lg border p-3">
                            <RadioGroupItem
                              className="mt-1"
                              id="schedule-always-on"
                              value="normal"
                            />
                            <div className="space-y-1">
                              <Label
                                className="font-medium"
                                htmlFor="schedule-always-on"
                              >
                                Normal Usage
                              </Label>
                              <p className="text-official-gray-400 text-sm">
                                Agent is ready to respond immediately when used
                                upon in a chat.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3 rounded-lg border p-3">
                            <RadioGroupItem
                              className="mt-1"
                              id="schedule-recurring"
                              value="scheduled"
                            />
                            <div className="w-full space-y-4">
                              <div className="space-y-1">
                                <Label
                                  className="font-medium"
                                  htmlFor="schedule-recurring"
                                >
                                  Normal Usage + Scheduled Execution
                                </Label>
                                <p className="text-official-gray-400 text-sm">
                                  Normal usage and also configure specific times and frequencies for
                                  agent tasks e.g. Twitter Agent that performs a workflow like checking and answering messages every 5 minutes.
                                </p>
                              </div>

                              {scheduleType === 'scheduled' && (
                                <div className="space-y-4 py-5">
                                  <FormField
                                    control={form.control}
                                    name="aiPrompt"
                                    render={({ field }) => (
                                      <Textarea
                                        {...field}
                                        className="min-h-[120px]"
                                        id="aiPrompt"
                                        placeholder="Enter AI instructions for the scheduled execution..."
                                        resize="vertical"
                                      />
                                    )}
                                  />
                                  <p className="text-sm text-official-gray-400">
                                    Write the prompt that will be used for the scheduled execution.
                                  </p>
                                  
                                  <FormField
                                    control={form.control}
                                    name="cronExpression"
                                    render={({ field }) => (
                                      <TextField
                                        field={field}
                                        helperMessage="Enter a cron expression eg: */30 * * * * (every 30 min) "
                                        label="Cron Expression"
                                      />
                                    )}
                                  />
                                  {readableCronExpression && (
                                    <div className="flex items-center gap-2 text-xs">
                                      <ScheduledTasksIcon className="size-4" />
                                      <span>
                                        This cron will run{' '}
                                        {readableCronExpression.toLowerCase()}{' '}
                                        <span className="text-gray-80 font-mono">
                                          ({form.watch('cronExpression')})
                                        </span>
                                      </span>
                                    </div>
                                  )}
                                  {!readableCronExpression && form.watch('cronExpression') && (
                                    <p className="text-xs text-red-500">Invalid Cron Expression</p>
                                  )}
                                  <div className="flex flex-wrap gap-2">
                                    {[
                                      {
                                        label: 'every 5 min',
                                        cron: '*/5 * * * *',
                                      },
                                      {
                                        label: 'every 5 hours',
                                        cron: '0 */5 * * *',
                                      },
                                      {
                                        label: 'every monday at 8am',
                                        cron: '0 8 * * 1',
                                      },
                                      {
                                        label: 'every january 1st at 12am',
                                        cron: '0 0 1 1 *',
                                      },
                                      {
                                        label: 'every 1st of the month at 12pm',
                                        cron: '0 12 1 * *',
                                      },
                                    ].map((item) => (
                                      <Badge
                                        className="bg-official-gray-850 hover:bg-official-gray-900 cursor-pointer font-normal"
                                        key={item.cron}
                                        onClick={() => {
                                          form.setValue(
                                            'cronExpression',
                                            item.cron,
                                          );
                                        }}
                                        variant="outline"
                                      >
                                        <span className="text-xs">
                                          {item.label}
                                        </span>
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </RadioGroup>
                      )}
                      {/* Show current tasks only in edit mode if they exist */}
                      {mode === 'edit' &&
                        agent?.cron_tasks &&
                        agent?.cron_tasks?.length > 0 && (
                          <div className="mt-2 space-y-4">
                            <div className="mb-2 flex items-center gap-2">
                              <ScheduledTasksIcon className="size-4 text-white" />
                              <h4 className="text-sm font-medium">
                                Current Scheduled Task
                              </h4>
                            </div>
                            <div className="mt-2 space-y-3">
                              {/* Assuming only one task is manageable via this form */}
                              {agent?.cron_tasks?.slice(0, 1).map((task) => (
                                <div
                                  className="bg-official-gray-900 flex items-center justify-between rounded-md border p-2"
                                  key={task.task_id}
                                >
                                  <div className="flex items-center gap-2 pl-1">
                                    <div className="bg-brand/70 h-2 w-2 rounded-full" />
                                    <span className="text-sm">
                                      {cronstrue.toString(task.cron, {
                                        throwExceptionOnParseError: false,
                                      })} ({task.cron})
                                    </span>
                                  </div>

                                  <Button
                                    className="text-official-gray-400 p-2 hover:bg-red-900/10 hover:text-red-400/90"
                                    isLoading={isRemovingTask}
                                    onClick={() =>
                                      onDeleteTask(task.task_id.toString())
                                    }
                                    size="auto"
                                    type="button"
                                    variant="ghost"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                             {/* Option to switch back to normal if a task exists */}
                             <Button 
                               className="text-xs text-blue-400 p-0 h-auto" 
                               onClick={() => {
                                 setScheduleType('normal');
                                 form.setValue('cronExpression', ''); // Clear expression when switching
                               }}
                               variant="link"
                             >
                               Switch back to Normal Usage (will remove schedule on save)
                             </Button>
                          </div>
                        )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <div className="bg-official-gray-950 sticky bottom-0 bg-gradient-to-t to-transparent pb-10">
              <div className="flex items-center justify-end gap-2">
                <Button
                  className="min-w-[120px]"
                  disabled={isPending}
                  onClick={() => {
                    if (currentTab === 'persona') {
                      navigate(-1);
                    } else if (currentTab === 'knowledge') {
                      setCurrentTab('persona');
                    } else if (currentTab === 'tools') {
                      setCurrentTab('knowledge');
                    } else if (currentTab === 'schedule') {
                       setCurrentTab('tools'); // Go back to tools from schedule
                    }
                  }}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {currentTab === 'persona'
                    ? t('common.cancel')
                    : t('common.back')}
                </Button>
                <Button
                  isLoading={isPending}
                  onClick={(e) => {
                    // Check validity before navigating or submitting
                    if (scheduleType === 'scheduled' && (!form.watch('cronExpression') || !readableCronExpression)) {
                       toast.error("Invalid or empty Cron Expression for scheduled execution.");
                       e.preventDefault(); // Prevent moving forward
                       setCurrentTab('schedule'); // Stay on schedule tab
                       return;
                    }

                    if (currentTab === 'persona') {
                      e.preventDefault();
                      setCurrentTab('knowledge');
                    } else if (currentTab === 'knowledge') {
                      e.preventDefault();
                      setCurrentTab('tools');
                    } else if (currentTab === 'tools') {
                      e.preventDefault();
                      setCurrentTab('schedule');
                    } 
                    // If currentTab is 'schedule', the button type is 'submit', 
                    // so default form submission occurs (handled by onSubmit)
                  }}
                  size="sm"
                  title={ (scheduleType === 'scheduled' && (!form.watch('cronExpression') || !readableCronExpression)) ? "Please enter a valid Cron Expression" : "" }
                  type={currentTab === 'schedule' ? 'submit' : 'button'}
                  className="min-w-[120px]"
                  // Disable Next/Save if scheduleType is 'scheduled' but cron expression is invalid or empty
                  disabled={isPending || (scheduleType === 'scheduled' && (!form.watch('cronExpression') || !readableCronExpression))}
                >
                  {currentTab === 'schedule'
                    ? t('common.save')
                    : t('common.next')}
                </Button>
                {mode === 'add' && currentTab === 'schedule' && (
                  <Button
                    isLoading={isPending}
                    onClick={() => {
                      // Trigger form validation and submission with the openChat option
                       form.handleSubmit((values) => submit(values, { openChat: true }))();
                    }}
                    size="sm"
                    title={ (scheduleType === 'scheduled' && (!form.watch('cronExpression') || !readableCronExpression)) ? "Please enter a valid Cron Expression" : "" }
                    type="button"
                    className="min-w-[120px] flex items-center gap-2"
                    // Also disable if schedule invalid
                    disabled={isPending || (scheduleType === 'scheduled' && (!form.watch('cronExpression') || !readableCronExpression))}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Save & Test Agent
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
        </div>
      </ResizablePanel>

      {/* Side Chat Panel */}
      {isSideChatOpen && mode === 'edit' && agent && (
        <>
          <ResizableHandle className="bg-gray-300" />
          <ResizablePanel 
            className="h-full min-h-0 flex flex-col" 
            collapsible 
            defaultSize={30} 
            maxSize={50} 
            minSize={20}
          >
            <div className="h-full min-h-0 overflow-hidden">
              <AgentSideChat agentId={agent.agent_id} onClose={() => setIsSideChatOpen(false)} />
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}

export default AgentForm;
