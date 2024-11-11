import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useCreateAgent } from '@shinkai_network/shinkai-node-state/v2/mutations/createAgent/useCreateAgent';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { SimpleLayout } from '../../pages/layout/simple-layout';
import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';

const addAgentFormSchema = z.object({
  name: z.string(),
  fullIdentityName: z.string(),
  llmProviderId: z.string(),
  uiDescription: z.string(),
  storage_path: z.string(),
  knowledge: z.array(z.string()),
  tools: z.array(z.string()),
  debugMode: z.boolean(),
  config: z
    .object({
      custom_prompt: z.string(),
      temperature: z.number(),
      seed: z.number(),
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
  const { t } = useTranslation();
  const form = useForm<AddAgentFormValues>({
    resolver: zodResolver(addAgentFormSchema),
    defaultValues: {
      name: 'agent_test',
      uiDescription:
        'It delivers strong performance at a lower cost compared to its peers, and is engineered for high endurance in large-scale AI deployments.',
      storage_path: '',
      knowledge: [],
      tools: [],
      debugMode: false,
      config: {
        custom_prompt: '',
        temperature: 0,
        seed: 0,
        top_k: 0,
        top_p: 0,
        stream: false,
        other_model_params: {},
      },
      fullIdentityName: `${auth?.shinkai_identity}/main/agent/agent_test`,
      llmProviderId: defaultAgentId,
    },
  });
  const { mutateAsync: createAgent, isPending } = useCreateAgent({
    onError: (error) => {
      toast.error('Failed to create agent', {
        description: error.response?.data?.message ?? error.message,
      });
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
        full_identity_name: values.fullIdentityName,
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
    <SimpleLayout title="Create Agent">
      <Form {...form}>
        <form
          className="flex flex-col justify-between space-y-6"
          onSubmit={form.handleSubmit(submit)}
        >
          <div className="flex grow flex-col space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <TextField field={field} label="Agent Name" />
              )}
            />

            <FormField
              control={form.control}
              name="fullIdentityName"
              render={({ field }) => (
                <TextField field={field} label="Full Identity Name" />
              )}
            />

            <FormField
              control={form.control}
              name="llmProviderId"
              render={({ field }) => (
                <TextField field={field} label="LLM Provider ID" />
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
            {/*<FormField*/}
            {/*  control={form.control}*/}
            {/*  name="uiDescription"*/}
            {/*  render={({ field }) => (*/}
            {/*    <TextField field={field} label="UI Description" />*/}
            {/*  )}*/}
            {/*/>*/}
            {/*TODO: improve form*/}
            {/*<FormField*/}
            {/*  control={form.control}*/}
            {/*  name="tools"*/}
            {/*  render={({ field }) => (*/}
            {/*    <TextField field={field} label="Tools" />*/}
            {/*  )}*/}
            {/*/>*/}
            <div className="!mt-10 space-y-4">
              <Collapsible className="rounded-lg bg-gray-400">
                <CollapsibleTrigger
                  className={cn(
                    'flex w-full max-w-full items-center justify-between gap-6 px-5 py-2',
                    '[&[data-state=open]>svg]:rotate-90',
                  )}
                >
                  <span className="flex-1 items-center gap-1 truncate py-2 text-left text-xs font-medium text-gray-50">
                    Knowledge
                  </span>

                  <ChevronRight className="text-gray-80 h-4 w-4 shrink-0" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-5 pb-5 pt-2.5">
                  TODO: kwnoledge
                </CollapsibleContent>
              </Collapsible>
              <Collapsible className="rounded-lg bg-gray-400">
                <CollapsibleTrigger
                  className={cn(
                    'flex w-full max-w-full items-center justify-between gap-6 px-5 py-2',
                    '[&[data-state=open]>svg]:rotate-90',
                  )}
                >
                  <span className="flex-1 items-center gap-1 truncate py-2 text-left text-xs font-medium text-gray-50">
                    Tools
                  </span>

                  <ChevronRight className="text-gray-80 h-4 w-4 shrink-0" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-5 pb-5 pt-2.5">
                  TODO: tools
                </CollapsibleContent>
              </Collapsible>
              <Collapsible className="rounded-lg bg-gray-400">
                <CollapsibleTrigger
                  className={cn(
                    'flex w-full max-w-full items-center justify-between gap-6 px-5 py-2',
                    '[&[data-state=open]>svg]:rotate-90',
                  )}
                >
                  <span className="flex-1 items-center gap-1 truncate py-2 text-left text-xs font-medium text-gray-50">
                    Model Configuration
                  </span>

                  <ChevronRight className="text-gray-80 h-4 w-4 shrink-0" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-5 pb-5 pt-2.5">
                  <div className="space-y-6">
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
                    <FormField
                      control={form.control}
                      name="config.custom_prompt"
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
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
          <Button
            className="w-full"
            disabled={isPending}
            isLoading={isPending}
            type="submit"
          >
            {t('common.save')}
          </Button>
        </form>
      </Form>
    </SimpleLayout>
  );
}

export default AddAgentPage;
