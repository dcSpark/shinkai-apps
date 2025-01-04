import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { Agent } from '@shinkai_network/shinkai-message-ts/api/agents/types';
import { JobConfig } from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { ShinkaiPath } from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { DEFAULT_CHAT_CONFIG } from '@shinkai_network/shinkai-node-state/v2/constants';
import { useCreateAgent } from '@shinkai_network/shinkai-node-state/v2/mutations/createAgent/useCreateAgent';
import { useUpdateAgent } from '@shinkai_network/shinkai-node-state/v2/mutations/updateAgent/useUpdateAgent';
import { useGetAgent } from '@shinkai_network/shinkai-node-state/v2/queries/getAgent/useGetAgent';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import {
  Badge,
  Button,
  Form,
  FormControl,
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
import { BoltIcon } from 'lucide-react';
import { InfoCircleIcon } from 'primereact/icons/infocircle';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { useSetJobScope } from '../../components/chat/context/set-job-scope-context';
import { SubpageLayout } from '../../pages/layout/simple-layout';
import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';

const agentFormSchema = z.object({
  name: z
    .string()
    .regex(
      /^[a-zA-Z0-9]+(_[a-zA-Z0-9]+)*$/,
      'It just accepts alphanumeric characters and underscores',
    ),
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
  const setSetJobScopeOpen = useSetJobScope((state) => state.setSetJobScopeOpen);
  const selectedKeys = useSetJobScope((state) => state.selectedKeys);
  const selectedFileKeysRef = useSetJobScope((state) => state.selectedFileKeysRef);
  const selectedFolderKeysRef = useSetJobScope((state) => state.selectedFolderKeysRef);
  const onSelectedKeysChange = useSetJobScope((state) => state.onSelectedKeysChange);
  const setFileKey = useSetJobScope((state) => state.setFileKey);
  const setFolderKey = useSetJobScope((state) => state.setFolderKey);

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
        vector_search_mode: "FillUpTo25k"
      }
    },
  });

  // Effect to update form when selected items change
  useEffect(() => {
    if (selectedKeys || selectedFileKeysRef.size > 0 || selectedFolderKeysRef.size > 0) {
      const agentData = {
        ...form.getValues(),
        scope: {
          vector_fs_items: Array.from(selectedFileKeysRef.values()),
          vector_fs_folders: Array.from(selectedFolderKeysRef.values()),
          vector_search_mode: "FillUpTo25k"
        }
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
        vector_search_mode: "FillUpTo25k"
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
        temperature: agent.config?.temperature ?? DEFAULT_CHAT_CONFIG.temperature,
        top_k: agent.config?.top_k ?? DEFAULT_CHAT_CONFIG.top_k,
        top_p: agent.config?.top_p ?? DEFAULT_CHAT_CONFIG.top_p,
        use_tools: agent.config?.use_tools ?? true,
        stream: agent.config?.stream ?? DEFAULT_CHAT_CONFIG.stream,
        other_model_params: agent.config?.other_model_params ?? {},
      });
      form.setValue('llmProviderId', agent.llm_provider_id);

      // Set selected files and folders
      if (agent.scope?.vector_fs_items?.length || agent.scope?.vector_fs_folders?.length) {
        const selectedVRFilesPathMap = agent.scope.vector_fs_items.reduce<Record<string, { checked: boolean }>>(
          (acc: Record<string, { checked: boolean }>, filePath: string) => {
            setFileKey(filePath, filePath);
            acc[filePath] = {
              checked: true,
            };
            return acc;
          },
          {},
        );

        const selectedVRFoldersPathMap = agent.scope.vector_fs_folders.reduce<Record<string, { checked: boolean }>>(
          (acc: Record<string, { checked: boolean }>, folderPath: string) => {
            setFolderKey(folderPath, folderPath);
            acc[folderPath] = {
              checked: true,
            };
            return acc;
          },
          {},
        );

        onSelectedKeysChange({
          ...selectedVRFilesPathMap,
          ...selectedVRFoldersPathMap,
        });

        form.setValue('scope', {
          vector_fs_items: agent.scope.vector_fs_items,
          vector_fs_folders: agent.scope.vector_fs_folders,
          vector_search_mode: agent.scope.vector_search_mode || "FillUpTo25k"
        });
      }
    }
  }, [agent, form, mode, onSelectedKeysChange, setFileKey, setFolderKey]);

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
      navigate('/ais?tab=agents');
    },
  });

  const { mutateAsync: updateAgent, isPending: isUpdating } = useUpdateAgent({
    onError: (error) => {
      toast.error('Failed to update agent', {
        description: error.response?.data?.message ?? error.message,
      });
    },
    onSuccess: () => {
      navigate('/ais?tab=agents');
    },
  });

  const { llmProviders } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const submit = async (values: AgentFormValues) => {
    const agentData = {
      agent_id: values.name,
      full_identity_name: `${auth?.shinkai_identity}/main/agent/${values.name}`,
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
        vector_search_mode: "FillUpTo25k"
      }
    };

    if (mode === 'edit') {
      await updateAgent({
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        agent: agentData,
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
    <TooltipProvider>
      <SubpageLayout className="max-w-4xl" title={mode === 'edit' ? 'Edit Agent' : 'Create new Agent'}>
        <p className="text-gray-80 -mt-8 py-3 pb-6 text-center text-sm">
          Create and explore custom AI agents with tailored instructions and
          diverse skills.
        </p>
        <Form {...form}>
          <form
            className="flex flex-col justify-between space-y-6"
            onSubmit={form.handleSubmit(submit)}
          >
            <div className="grid grid-cols-[1fr_360px] gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <TextField
                      autoFocus
                      field={{
                        ...field,
                        onChange: (e) => {
                          const value = e.target.value;
                          const alphanumericValue = value.replace(
                            /[^a-zA-Z0-9_]/g,
                            '_',
                          );
                          field.onChange({
                            ...e,
                            target: {
                              value: alphanumericValue,
                            },
                          });
                        },
                        disabled: mode === 'edit',
                      }}
                      label="Agent Name"
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="uiDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          className="!min-h-[100px] !resize-y text-sm [&]:resize-y"
                          onChange={field.onChange}
                          spellCheck={false}
                          style={{ resize: 'vertical' }}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="llmProviderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('chat.form.selectAI')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t('chat.form.selectAI')}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[40vh]">
                          {llmProviders?.length &&
                            llmProviders.map((llmProvider) => (
                              <SelectItem
                                key={llmProvider.id}
                                value={llmProvider.id}
                              >
                                <span>{llmProvider.id} </span>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <div className="space-y-6 rounded-lg bg-gray-400 px-4 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex-1 items-center gap-1 truncate text-left text-xs font-semibold text-gray-50">
                      Tools
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        className="h-[30px] text-xs"
                        onClick={() => {
                          navigate('/tools/create');
                        }}
                        size="auto"
                        variant="outline"
                      >
                        <PlusIcon className="mr-1 size-3.5" />
                        Create New Tool
                      </Button>
                    </div>
                  </div>
                  <div className="flex max-h-[28vh] flex-col gap-2.5 overflow-auto">
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
                                <div className="flex w-full items-center gap-3">
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
                                            key_name: conf.BasicConfig.key_name,
                                            key_value:
                                              conf.BasicConfig.key_value ?? '',
                                            required: conf.BasicConfig.required,
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
                                      className="max-w-[40ch] truncate text-xs text-gray-50"
                                      htmlFor={tool.tool_router_key}
                                    >
                                      {formatText(tool.name)}
                                    </label>
                                    <Tooltip>
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
                                          {tool.description}
                                        </TooltipContent>
                                      </TooltipPortal>
                                    </Tooltip>
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

              <div className="space-y-4">
                <div className="space-y-6 rounded-lg bg-gray-400 px-4 py-4 pb-7">
                  <span className="flex-1 items-center gap-1 truncate py-2 text-left text-xs font-semibold text-gray-50">
                    AI Model Configuration
                  </span>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="config.custom_system_prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System Prompt</FormLabel>
                          <FormControl>
                            <Textarea
                              className="!min-h-[130px] !resize-y text-sm [&]:resize-y"
                              spellCheck={false}
                              style={{ resize: 'vertical' }}
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

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
                                Temperature is a parameter that affects the
                                randomness of AI outputs. Higher temp = more
                                unexpected, lower temp = more predictable.
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
                                Adjust the probability threshold to increase the
                                relevance of results. For example, a threshold
                                of 0.9 could be optimal for targeted, specific
                                applications, whereas a threshold of 0.95 or
                                0.97 might be preferred for tasks that require
                                broader, more creative responses.
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
                                Adjust the count of key words for creating
                                sequences. This parameter governs the extent of
                                the generated passage, forestalling too much
                                repetition. Selecting a higher figure yields
                                longer narratives, whereas a smaller figure
                                keeps the text brief.
                              </HoverCardContent>
                            </HoverCard>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-6 rounded-lg bg-gray-400 px-4 py-4 pb-7">
                  <span className="flex-1 items-center gap-1 truncate py-2 text-left text-xs font-semibold text-gray-50">
                    Agent Context
                  </span>

                  <div className="space-y-4">
                    <Button
                      className={cn(
                        'flex h-auto w-auto items-center gap-2 rounded-lg bg-gray-500 px-2.5 py-1.5',
                      )}
                      onClick={() => {
                        setSetJobScopeOpen(true);
                      }}
                      size="auto"
                      type="button"
                      variant="ghost"
                    >
                      <div className="flex items-center gap-2">
                        <FilesIcon className="h-4 w-4" />
                        <p className="text-xs text-white">{t('vectorFs.localFiles')}</p>
                      </div>
                      {Object.keys(selectedKeys || {}).length > 0 ? (
                        <Badge className="bg-brand inline-flex h-5 w-5 items-center justify-center rounded-full border-gray-200 p-0 text-center text-gray-50">
                          {Object.keys(selectedKeys || {}).length}
                        </Badge>
                      ) : (
                        <Badge className="inline-flex h-5 w-5 items-center justify-center rounded-full border-gray-200 bg-gray-200 p-0 text-center text-gray-50">
                          <PlusIcon className="h-3.5 w-3.5" />
                        </Badge>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
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
          </form>
        </Form>
      </SubpageLayout>
    </TooltipProvider>
  );
}

export default AgentForm; 