import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { DEFAULT_CHAT_CONFIG } from '@shinkai_network/shinkai-node-state/v2/constants';
import { useCreateAgent } from '@shinkai_network/shinkai-node-state/v2/mutations/createAgent/useCreateAgent';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import {
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
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { PlusIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { SubpageLayout } from '../../pages/layout/simple-layout';
import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';

const addAgentFormSchema = z.object({
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
      stream: z.boolean(),
      other_model_params: z.record(z.string()),
    })
    .nullable(),
});

type AddAgentFormValues = z.infer<typeof addAgentFormSchema>;

function AddAgentPage() {
  const defaultAgentId = useSettings((state) => state.defaultAgentId);
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const form = useForm<AddAgentFormValues>({
    resolver: zodResolver(addAgentFormSchema),
    defaultValues: {
      name: '',
      uiDescription: '',
      storage_path: '',
      knowledge: [],
      tools: [],
      debugMode: false,
      config: {
        stream: false, // disable stream by default for tooling
        temperature: DEFAULT_CHAT_CONFIG.temperature,
        top_p: DEFAULT_CHAT_CONFIG.top_p,
        top_k: DEFAULT_CHAT_CONFIG.top_k,
        custom_prompt: '',
        custom_system_prompt: '',
        other_model_params: {},
      },
      llmProviderId: defaultAgentId,
    },
  });

  const { data: toolsList } = useGetTools({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const { mutateAsync: createAgent, isPending } = useCreateAgent({
    onError: (error) => {
      toast.error('Failed to create agent', {
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

  const submit = async (values: AddAgentFormValues) => {
    await createAgent({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      agent: {
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
      },
    });
  };

  return (
    <SubpageLayout className="max-w-4xl" title="Create new Agent">
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
                        className="!min-h-[100px] resize-none text-sm"
                        onChange={field.onChange}
                        spellCheck={false}
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('chat.form.selectAI')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
              {/*<div className="space-y-6 rounded-lg bg-gray-400 px-4 py-4">*/}
              {/*  <span className="flex-1 items-center gap-1 truncate py-2 text-left text-xs font-semibold text-gray-50">*/}
              {/*    Knowledge*/}
              {/*  </span>*/}
              {/*  <div>TODO: kwnoledge</div>*/}
              {/*</div>*/}
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
                      checked={form.watch('tools').length === toolsList?.length}
                      onCheckedChange={(checked) => {
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
                    <span className="text-gray-80 text-xs">Enabled All</span>
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
                              <Switch
                                checked={field.value.includes(
                                  tool.tool_router_key,
                                )}
                                onCheckedChange={() => {
                                  field.onChange(
                                    field.value.includes(tool.tool_router_key)
                                      ? field.value.filter(
                                          (value) =>
                                            value !== tool.tool_router_key,
                                        )
                                      : [...field.value, tool.tool_router_key],
                                  );
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger className="flex items-center gap-1">
                                    <FormLabel className="text-gray-80 static space-y-1.5 text-xs">
                                      {formatText(tool.name)}
                                    </FormLabel>
                                  </TooltipTrigger>
                                  <TooltipPortal>
                                    <TooltipContent
                                      align="start"
                                      alignOffset={-10}
                                      className="max-w-md"
                                      side="top"
                                    >
                                      {tool.description}
                                    </TooltipContent>
                                  </TooltipPortal>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
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
                            className="!min-h-[130px] resize-none text-sm"
                            spellCheck={false}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/*<FormField*/}
                  {/*  control={form.control}*/}
                  {/*  name="config.stream"*/}
                  {/*  render={({ field }) => (*/}
                  {/*    <FormItem className="flex w-full flex-col gap-3">*/}
                  {/*      <div className="flex gap-3">*/}
                  {/*        <FormControl>*/}
                  {/*          <Switch*/}
                  {/*            checked={field.value}*/}
                  {/*            onCheckedChange={field.onChange}*/}
                  {/*          />*/}
                  {/*        </FormControl>*/}
                  {/*        <div className="space-y-1 leading-none">*/}
                  {/*          <FormLabel className="static space-y-1.5 text-sm text-white">*/}
                  {/*            Enable Stream*/}
                  {/*          </FormLabel>*/}
                  {/*        </div>*/}
                  {/*      </div>*/}
                  {/*    </FormItem>*/}
                  {/*  )}*/}
                  {/*/>*/}
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
                              relevance of results. For example, a threshold of
                              0.9 could be optimal for targeted, specific
                              applications, whereas a threshold of 0.95 or 0.97
                              might be preferred for tasks that require broader,
                              more creative responses.
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
                              longer narratives, whereas a smaller figure keeps
                              the text brief.
                            </HoverCardContent>
                          </HoverCard>
                        </FormControl>
                      </FormItem>
                    )}
                  />
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
  );
}

export default AddAgentPage;
