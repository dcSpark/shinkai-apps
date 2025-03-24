import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { DEFAULT_CHAT_CONFIG } from '@shinkai_network/shinkai-node-state/v2/constants';
import { useCreateAgent } from '@shinkai_network/shinkai-node-state/v2/mutations/createAgent/useCreateAgent';
import { useUpdateAgent } from '@shinkai_network/shinkai-node-state/v2/mutations/updateAgent/useUpdateAgent';
import { useGetAgent } from '@shinkai_network/shinkai-node-state/v2/queries/getAgent/useGetAgent';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import {
  Badge,
  Button,
  Card,
  CardContent,
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
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { FilesIcon } from '@shinkai_network/shinkai-ui/assets';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import {
  ArrowDownIcon,
  BoltIcon,
  ChevronDown,
  FileText,
  Folder,
  LucideArrowLeft,
  Plus,
} from 'lucide-react';
import { InfoCircleIcon } from 'primereact/icons/infocircle';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, To, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { merge } from 'ts-deepmerge';
import { z } from 'zod';

import { useSetJobScope } from '../../components/chat/context/set-job-scope-context';
import { SubpageLayout } from '../../pages/layout/simple-layout';
import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';
import { AIModelSelector } from '../chat/chat-action-bar/ai-update-selection-action-bar';

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
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

interface AgentFormProps {
  mode: 'add' | 'edit';
}

function AgentForm({ mode }: AgentFormProps) {
  const { agentId } = useParams();
  const defaultAgentId = useSettings((state) => state.defaultAgentId);
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState('persona');

  const setSetJobScopeOpen = useSetJobScope(
    (state) => state.setSetJobScopeOpen,
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

  // Effect to handle initial agent data
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
    onSuccess: () => {
      navigate('/agents');
    },
  });

  const { mutateAsync: updateAgent, isPending: isUpdating } = useUpdateAgent({
    onError: (error) => {
      toast.error('Failed to update agent', {
        description: error.response?.data?.message ?? error.message,
      });
    },
    onSuccess: () => {
      navigate('/agents');
    },
  });

  const { llmProviders } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const submit = async (values: AgentFormValues) => {
    const agentId = values.name.replace(/[^a-zA-Z0-9_]/g, '_');
    const agentData = {
      agent_id: agentId,
      full_identity_name: `${auth?.shinkai_identity}/main/agent/${agentId}`,
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

    if (mode === 'edit' && agent) {
      await updateAgent({
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        agent: merge(agentData, {
          agent_id: agent.agent_id,
          full_identity_name: `${auth?.shinkai_identity}/main/agent/${agent.agent_id}`,
        }),
      });
    } else {
      await createAgent({
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        agent: agentData,
      });
    }
  };

  const isPending = mode === 'edit' ? isUpdating : isCreating;

  return (
    <div className="container h-full max-w-2xl">
      <div className="flex items-center gap-5">
        <Link to={-1 as To}>
          <LucideArrowLeft />
          <span className="sr-only">{t('common.back')}</span>
        </Link>
        <div className="flex flex-col gap-1 pb-6 pt-10">
          <h1 className="font-clash text-2xl font-medium">
            {mode === 'edit' ? 'Update Agent' : 'Create New Agent'}
          </h1>
          <p className="text-official-gray-400 text-sm">
            Create and explore custom AI agents with tailored instructions and
            diverse skills.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          className="flex w-full flex-col justify-between space-y-6"
          onSubmit={form.handleSubmit(submit)}
        >
          <div className="mx-auto w-full">
            <div className="space-y-6">
              <Tabs
                className="flex flex-col gap-4"
                defaultValue="persona"
                onValueChange={setCurrentTab}
                value={currentTab}
              >
                <TabNavigation />

                <TabsContent value="persona">
                  <div className="space-y-8">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <TextField
                          autoFocus
                          field={field}
                          helperMessage="Enter a unique name for your AI agent"
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
                            Describe what your custom agent can do
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
                              className="placeholder-official-gray-500 !min-h-[230px] text-sm"
                              placeholder="e.g., You are a professional UX expert. Answer questions about UI/UX best practices."
                              spellCheck={false}
                              style={{ resize: 'vertical' }}
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
                          {/* <FormLabel>{t('chat.form.selectAI')}</FormLabel> */}
                          <AIModelSelector
                            className="bg-official-gray-900 !h-auto w-full rounded-lg border !border-gray-200 py-2.5"
                            onValueChange={field.onChange}
                            value={field.value}
                          />
                        </div>
                      )}
                    />

                    <Collapsible>
                      <CollapsibleTrigger>
                        <button
                          className="text-official-gray-400 hover:text-official-gray-300 flex items-center gap-1 text-sm"
                          type="button"
                        >
                          Advanced Options{' '}
                          <ChevronDown className="ml-1 size-4" />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="space-y-4">
                          <div className="space-y-6 rounded-lg px-4 py-4 pb-7">
                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name="config.stream"
                                render={({ field }) => (
                                  <FormItem className="flex w-full flex-col gap-3">
                                    <div className="flex gap-3">
                                      <FormControl>
                                        <Switch
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="static space-y-1.5 text-sm text-white">
                                          Enable Stream
                                        </FormLabel>
                                      </div>
                                    </div>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="config.use_tools"
                                render={({ field }) => (
                                  <FormItem className="flex w-full flex-col gap-3">
                                    <div className="flex gap-3">
                                      <FormControl>
                                        <Switch
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="static space-y-1.5 text-sm text-white">
                                          Enable Tools
                                        </FormLabel>
                                      </div>
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
                                              <span className="text-muted-foreground hover:border-border w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm">
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
                                          Temperature is a parameter that
                                          affects the randomness of AI outputs.
                                          Higher temp = more unexpected, lower
                                          temp = more predictable.
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
                                              <Label htmlFor="topP">
                                                Top P
                                              </Label>
                                              <span className="text-muted-foreground hover:border-border w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm">
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
                                          applications, whereas a threshold of
                                          0.95 or 0.97 might be preferred for
                                          tasks that require broader, more
                                          creative responses.
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
                                              <Label htmlFor="topK">
                                                Top K
                                              </Label>
                                              <span className="text-muted-foreground hover:border-border w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm">
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
                                          Adjust the count of key words for
                                          creating sequences. This parameter
                                          governs the extent of the generated
                                          passage, forestalling too much
                                          repetition. Selecting a higher figure
                                          yields longer narratives, whereas a
                                          smaller figure keeps the text brief.
                                        </HoverCardContent>
                                      </HoverCard>
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </TabsContent>

                <TabsContent value="knowledge">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h2 className="text-lg font-medium">Knowledge Base</h2>
                      <p className="text-sm text-gray-50">
                        Add documents, links, or other sources of information
                        your agent can reference.
                      </p>
                    </div>

                    <Card>
                      <CardContent className="flex min-h-[200px] flex-col items-center justify-center space-y-4 p-6 text-center">
                        <FileText className="text-muted-foreground h-10 w-10" />
                        <div>
                          <p className="font-medium">No documents added</p>
                          <p className="text-muted-foreground text-sm">
                            Upload documents your agent can learn from
                          </p>
                        </div>
                        <Button className="mt-2" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Documents
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-medium">Agent Context</h3>

                    <div className="space-y-4">
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
                            <Badge className="bg-brand inline-flex h-5 w-5 items-center justify-center rounded-full border-gray-200 p-0 text-center text-gray-50">
                              {Object.keys(selectedKeys || {}).length}
                            </Badge>
                          ) : (
                            <Badge className="inline-flex h-5 w-5 items-center justify-center rounded-full border-gray-200 bg-gray-200 p-0 text-center text-gray-50">
                              <FilesIcon className="h-3.5 w-3.5" />
                            </Badge>
                          )}
                          <p className="text-xs text-white">
                            {t('vectorFs.localFiles')}
                          </p>
                        </div>
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tasks">
                  <div className="space-y-4">
                    <div className="space-y-6 rounded-lg px-4 py-4">
                      <div className="space-y-2">
                        <h1 className="text-lg font-medium">Tools</h1>
                        <p className="text-sm text-gray-50">
                          Select which tools & skills your agent can use to
                          complete tasks.
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={() => {
                              navigate('/tools');
                            }}
                            size="xs"
                            variant="outline"
                          >
                            <PlusIcon className="mr-1 size-3.5" />
                            Create New Tool
                          </Button>
                        </div>
                      </div>
                      <div className="flex max-h-[40vh] flex-col gap-5 overflow-auto">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={
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
                              if (!isAllConfigFilled) {
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
                          <label className="text-xs text-gray-50" htmlFor="all">
                            Enabled All
                          </label>
                        </div>
                        {toolsList?.map((tool) => (
                          <FormField
                            control={form.control}
                            key={tool.tool_router_key}
                            name="tools"
                            render={({ field }) => (
                              <FormItem className="flex w-full flex-col gap-3">
                                <div className="flex items-center gap-3">
                                  <FormControl>
                                    <div className="flex w-full items-start gap-3">
                                      <Switch
                                        checked={field.value.includes(
                                          tool.tool_router_key,
                                        )}
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
                                      <div className="inline-flex flex-1 items-center gap-2 leading-none">
                                        <label
                                          className="flex flex-col gap-2 truncate text-xs text-gray-50"
                                          htmlFor={tool.tool_router_key}
                                        >
                                          <span className="text-sm text-white">
                                            {formatText(tool.name)}
                                          </span>
                                          <span className="text-official-gray-400 text-sm">
                                            {tool.description}
                                          </span>
                                        </label>
                                        {/* <Tooltip>
                                            <TooltipTrigger className="flex shrink-0 items-center gap-1">
                                              <InfoCircleIcon className="h-3 w-3 text-gray-100" />
                                            </TooltipTrigger>
                                            <TooltipPortal>
                                              <TooltipContent
                                                align="center"
                                                alignOffset={-10}
                                                className="max-w-md"
                                                side="top"
                                              >

                                              </TooltipContent>
                                            </TooltipPortal>
                                          </Tooltip> */}
                                      </div>
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
                                    </div>
                                  </FormControl>
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* <FooterActions currentTab={currentTab} /> */}

          <div className="bg-official-gray-950 sticky bottom-0 bg-gradient-to-t to-transparent pb-10">
            <div className="flex items-center justify-end gap-2">
              <Button
                className="min-w-[120px]"
                disabled={isPending}
                onClick={() => navigate('/ais?tab=agents')}
                size="sm"
                type="button"
                variant="outline"
              >
                {t('common.cancel')}
              </Button>
              <Button
                className="min-w-[120px]"
                disabled={isPending}
                isLoading={isPending}
                size="sm"
                type="submit"
              >
                {t('common.save')}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default AgentForm;

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
        value="tasks"
      >
        <Badge className="bg-official-gray-700 inline-flex size-5 items-center justify-center rounded-full border-none border-gray-200 p-0 text-center text-[10px] text-gray-50">
          3
        </Badge>
        <span>Tools</span>
      </TabsTrigger>
    </TabsList>
  );
};

const FooterActions = ({ currentTab }: { currentTab: string }) => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto mt-12 flex max-w-3xl justify-end space-x-4">
      <Button
        className="min-w-[90px]"
        onClick={() => navigate(-1)}
        size="sm"
        variant="outline"
      >
        Cancel
      </Button>
      <Button className="min-w-[90px]" size="sm">
        {currentTab === 'schedule' ? 'Save' : 'Continue'}
      </Button>
    </div>
  );
};
