import { zodResolver } from '@hookform/resolvers/zod';
import { DialogClose } from '@radix-ui/react-dialog';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useCreateAgent } from '@shinkai_network/shinkai-node-state/v2/mutations/createAgent/useCreateAgent';
import { useRemoveAgent } from '@shinkai_network/shinkai-node-state/v2/mutations/removeAgent/useRemoveAgent';
import { useGetAgents } from '@shinkai_network/shinkai-node-state/v2/queries/getAgents/useGetAgents';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import {
  Badge,
  Button,
  buttonVariants,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Label,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Slider,
  Switch,
  Textarea,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ChevronRight, Edit, Plus, TrashIcon } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';

function Agents() {
  const auth = useAuth((state) => state.auth);

  const { data: agents } = useGetAgents({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  return (
    <div className="flex h-full flex-col space-y-3">
      <div className="absolute right-3 top-0">
        <AddAgentSheet />
      </div>
      {!agents?.length ? (
        <div className="flex grow flex-col items-center justify-center">
          <div className="mb-8 space-y-3 text-center">
            <span aria-hidden className="text-5xl">
              🤖
            </span>
            <p className="text-2xl font-semibold">No available agents</p>
            <p className="text-center text-sm font-medium text-gray-100">
              Create your first Agent to start asking Shinkai AI.
            </p>
          </div>

          <AddAgentSheet />
        </div>
      ) : (
        <ScrollArea className="flex h-full flex-col justify-between [&>div>div]:!block">
          <div className="divide-y divide-gray-400">
            {agents?.map((agent) => (
              <AgentCard
                agentId={agent.agent_id}
                agentName={agent.name}
                key={agent.agent_id}
                llmProviderId={agent.llm_provider_id}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

export default Agents;

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

const AddAgentSheet = () => {
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
    <Sheet>
      <SheetTrigger asChild>
        <Button className="px-4" size="sm">
          <Plus className="h-4 w-4" />
          <span>Add Agent</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="h-full overflow-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-normal">Create Agent</SheetTitle>
        </SheetHeader>
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
                                  Adjust the probability threshold to increase
                                  the relevance of results. For example, a
                                  threshold of 0.9 could be optimal for
                                  targeted, specific applications, whereas a
                                  threshold of 0.95 or 0.97 might be preferred
                                  for tasks that require broader, more creative
                                  responses.
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
                                  sequences. This parameter governs the extent
                                  of the generated passage, forestalling too
                                  much repetition. Selecting a higher figure
                                  yields longer narratives, whereas a smaller
                                  figure keeps the text brief.
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
      </SheetContent>
    </Sheet>
  );
};

const AgentCard = ({
  agentId,
  agentName,
  llmProviderId,
}: {
  agentId: string;
  agentName: string;
  llmProviderId: string;
}) => {
  const { t } = useTranslation();
  const [isDeleteAgentDrawerOpen, setIsDeleteAgentDrawerOpen] =
    React.useState(false);
  const [isEditAgentDrawerOpen, setIsEditAgentDrawerOpen] =
    React.useState(false);

  const navigate = useNavigate();

  return (
    <React.Fragment>
      <div
        className="flex cursor-pointer items-center justify-between gap-1 rounded-lg py-3.5 pr-2.5 hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-400"
        data-testid={`${agentId}-agent-button`}
        onClick={() => {
          navigate(`/inboxes`, { state: { agentName: agentId } });
        }}
        role="button"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg">
            <svg fill={'none'} height={24} viewBox="0 0 24 24" width={24}>
              <path
                d="M4 15.5C2.89543 15.5 2 14.6046 2 13.5C2 12.3954 2.89543 11.5 4 11.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <path
                d="M20 15.5C21.1046 15.5 22 14.6046 22 13.5C22 12.3954 21.1046 11.5 20 11.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <path
                d="M7 7L7 4"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <path
                d="M17 7L17 4"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <circle
                cx="7"
                cy="3"
                r="1"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <circle
                cx="17"
                cy="3"
                r="1"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <path
                d="M13.5 7H10.5C7.67157 7 6.25736 7 5.37868 7.90898C4.5 8.81796 4.5 10.2809 4.5 13.2069C4.5 16.1329 4.5 17.5958 5.37868 18.5048C6.25736 19.4138 7.67157 19.4138 10.5 19.4138H11.5253C12.3169 19.4138 12.5962 19.5773 13.1417 20.1713C13.745 20.8283 14.6791 21.705 15.5242 21.9091C16.7254 22.1994 16.8599 21.7979 16.5919 20.6531C16.5156 20.327 16.3252 19.8056 16.526 19.5018C16.6385 19.3316 16.8259 19.2898 17.2008 19.2061C17.7922 19.074 18.2798 18.8581 18.6213 18.5048C19.5 17.5958 19.5 16.1329 19.5 13.2069C19.5 10.2809 19.5 8.81796 18.6213 7.90898C17.7426 7 16.3284 7 13.5 7Z"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <path
                d="M9.5 15C10.0701 15.6072 10.9777 16 12 16C13.0223 16 13.9299 15.6072 14.5 15"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <path
                d="M9.00896 11H9"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M15.009 11H15"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="flex flex-col items-baseline gap-2">
            <span className="w-full truncate text-start text-sm">
              {agentName}{' '}
            </span>
            <Badge className="text-gray-80 truncate bg-gray-400 text-start text-xs font-normal shadow-none">
              {llmProviderId}
            </Badge>
          </div>
        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                buttonVariants({
                  variant: 'tertiary',
                  size: 'icon',
                }),
                'border-0 hover:bg-gray-500/40',
              )}
              onClick={(event) => {
                event.stopPropagation();
              }}
              role="button"
              tabIndex={0}
            >
              <span className="sr-only">{t('common.moreOptions')}</span>
              <DotsVerticalIcon className="text-gray-100" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[160px] border bg-gray-500 px-2.5 py-2"
          >
            {[
              {
                name: t('common.edit'),
                icon: <Edit className="mr-3 h-4 w-4" />,
                onClick: () => {
                  setIsEditAgentDrawerOpen(true);
                },
              },
              {
                name: t('common.delete'),
                icon: <TrashIcon className="mr-3 h-4 w-4" />,
                onClick: () => {
                  setIsDeleteAgentDrawerOpen(true);
                },
              },
            ].map((option) => (
              <React.Fragment key={option.name}>
                {option.name === 'Delete' && (
                  <DropdownMenuSeparator className="bg-gray-300" />
                )}
                <DropdownMenuItem
                  key={option.name}
                  onClick={(event) => {
                    event.stopPropagation();
                    option.onClick();
                  }}
                >
                  {option.icon}
                  {option.name}
                </DropdownMenuItem>
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/*<EditLLMProviderDrawer*/}
      {/*  agentApiKey={agentApiKey}*/}
      {/*  agentExternalUrl={externalUrl}*/}
      {/*  agentId={llmProviderId}*/}
      {/*  agentModelProvider={model.split(':')[0]}*/}
      {/*  agentModelType={model.split(':')[1]}*/}
      {/*  onOpenChange={setIsEditAgentDrawerOpen}*/}
      {/*  open={isEditAgentDrawerOpen}*/}
      {/*/>*/}
      <RemoveAgentDrawer
        agentId={agentId}
        onOpenChange={setIsDeleteAgentDrawerOpen}
        open={isDeleteAgentDrawerOpen}
      />
    </React.Fragment>
  );
};

const RemoveAgentDrawer = ({
  open,
  onOpenChange,
  agentId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
}) => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const { mutateAsync: removeAgent, isPending } = useRemoveAgent({
    onSuccess: () => {
      onOpenChange(false);
      toast.success('Delete agent successfully');
    },
    onError: (error) => {
      toast.error('Failed delete agent', {
        description: error.response?.data?.message ?? error.message,
      });
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="pb-0">
          Delete Agent <span className="font-mono text-base">{agentId}</span> ?
        </DialogTitle>
        <DialogDescription>
          The agent will be permanently deleted. This action cannot be undone.
        </DialogDescription>

        <DialogFooter>
          <div className="flex gap-2 pt-4">
            <DialogClose asChild className="flex-1">
              <Button
                className="min-w-[100px] flex-1"
                size="sm"
                type="button"
                variant="ghost"
              >
                {t('common.cancel')}
              </Button>
            </DialogClose>
            <Button
              className="min-w-[100px] flex-1"
              disabled={isPending}
              isLoading={isPending}
              onClick={async () => {
                await removeAgent({
                  nodeAddress: auth?.node_address ?? '',
                  agentId,
                  token: auth?.api_v2_key ?? '',
                });
              }}
              size="sm"
              variant="destructive"
            >
              {t('common.delete')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
