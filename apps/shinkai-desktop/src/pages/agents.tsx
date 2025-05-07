import { DialogClose } from '@radix-ui/react-dialog';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { GeneratedAgent } from '@shinkai_network/shinkai-message-ts/api/agents/types';
import { RecurringTask } from '@shinkai_network/shinkai-message-ts/api/recurring-tasks/types';
import { useCreateAgent } from '@shinkai_network/shinkai-node-state/v2/mutations/createAgent/useCreateAgent';
import { useExportAgent } from '@shinkai_network/shinkai-node-state/v2/mutations/exportAgent/useExportAgent';
import { useGenerateAgentFromPrompt } from '@shinkai_network/shinkai-node-state/v2/mutations/generateAgentFromPrompt/useGenerateAgentFromPrompt';
import { useRemoveAgent } from '@shinkai_network/shinkai-node-state/v2/mutations/removeAgent/useRemoveAgent';
import { useGetAgents } from '@shinkai_network/shinkai-node-state/v2/queries/getAgents/useGetAgents';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  ChatInputArea,
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
  ScrollArea,
  Separator,
  Skeleton,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  AgentIcon,
  AIAgentIcon,
  AisIcon,
  CreateAIIcon,
  ScheduledTasksIcon,
  SendIcon,
  ToolsIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { save } from '@tauri-apps/plugin-dialog';
import * as fs from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/plugin-fs';
import cronstrue from 'cronstrue';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  DownloadIcon,
  Edit,
  Plus,
  RefreshCcw,
  TrashIcon,
} from 'lucide-react';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import ImportAgentModal from '../components/agent/import-agent-modal';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';

function AgentsPage() {
  const auth = useAuth((state) => state.auth);

  const [prompt, setPrompt] = React.useState(
    'Generate an AI Agent that can help me with my spanish learning',
  );

  const [generatedAgent, setGeneratedAgent] =
    React.useState<GeneratedAgent | null>(hardcodedResponse.result);

  const { t } = useTranslation();
  const {
    mutateAsync: generateAgentFromPrompt,
    isPending,
    isSuccess,
    isError,
  } = useGenerateAgentFromPrompt({
    onSuccess: (data) => {
      setGeneratedAgent(data.result);
    },
  });

  const defaultAI = useSettings((state) => state.defaultAgentId);

  const navigate = useNavigate();
  const { data: agents } = useGetAgents({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const { mutateAsync: createAgent, isPending: isCreating } = useCreateAgent({
    onSuccess: (data, variables) => {
      toast.success('Agent created successfully');
      navigate(`/agents/edit/${variables.agent.agent_id}?openChat=true`);
    },
    onError: (error) => {
      toast.error('Failed to create agent', {
        description: error.response?.data?.message ?? error.message,
      });
    },
  });

  const isAgentGenPromptLoading = isPending;
  const isAgentGenPromptSuccess = isSuccess;
  const isAgentGenPromptError = isError;
  const isAgentGenPromptIdle = !isPending && !isSuccess && !isError;

  const renderContent = () => {
    if (isAgentGenPromptIdle) {
      return (
        <div className="h-full">
          <div className="container flex h-full flex-col">
            <div className="flex flex-col gap-1 pb-6 pt-10">
              <div className="flex justify-between gap-4">
                <h1 className="font-clash text-xl font-medium">Agents</h1>
                <div className="flex gap-2">
                  <ImportAgentModal />
                  <Button
                    className="min-w-[100px]"
                    onClick={() => {
                      navigate('/add-agent');
                    }}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Agent</span>
                  </Button>
                </div>
              </div>
            </div>
            <div className="mb-10">
              <Card className="border-none shadow-sm">
                <CardContent className="px-0 pb-1 pt-8">
                  <div className="space-y-5">
                    <div className="space-y-1 text-left">
                      <h2 className="font-clash text-3xl font-medium">
                        Turn an idea into an agent instantly.
                      </h2>
                      <h3 className="text-official-gray-400 text-sm">
                        Describe what you need, and we&apos;ll generate a
                        personalized AI agent for you.
                      </h3>
                    </div>

                    <ChatInputArea
                      autoFocus
                      bottomAddons={
                        <div className="flex items-end justify-end gap-3 px-3 pb-2">
                          <Button
                            className={cn('size-[36px] p-2')}
                            disabled={prompt === '' || isPending}
                            isLoading={isPending}
                            onClick={() => {
                              generateAgentFromPrompt({
                                nodeAddress: auth?.node_address ?? '',
                                token: auth?.api_v2_key ?? '',
                                llmProviderId: defaultAI,
                                prompt,
                              });
                            }}
                            size="icon"
                            type="button"
                          >
                            <SendIcon className="h-full w-full" />
                            <span className="sr-only">
                              {t('chat.sendMessage')}
                            </span>
                          </Button>
                        </div>
                      }
                      onChange={(value) => {
                        setPrompt(value);
                      }}
                      onSubmit={() => {
                        generateAgentFromPrompt({
                          nodeAddress: auth?.node_address ?? '',
                          token: auth?.api_v2_key ?? '',
                          llmProviderId: defaultAI,
                          prompt,
                        });
                      }}
                      placeholder={
                        'Describe what you want your agent to do... For example: I need a Spanish translator agent that helps translate text and provide cultural context.'
                      }
                      textareaClassName="max-h-[200px] min-h-[120px] p-4 text-sm"
                      value={prompt}
                    />
                  </div>
                  <div className="flex w-full flex-wrap items-center justify-center gap-3 py-6">
                    {AGENTS_SUGGESTIONS.map((suggestion) => (
                      <Button
                        key={suggestion.text}
                        onClick={() => {
                          setPrompt(suggestion.prompt ?? '');
                        }}
                        size="xs"
                        type="button"
                        variant="outline"
                      >
                        <AgentIcon className="mr-1 size-4" />
                        {suggestion.text}
                        <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <h1 className="font-clash pb-4 pt-4 text-lg font-medium">
              Your Agents
            </h1>
            <div className="flex flex-1 flex-col space-y-3 pb-10">
              {!agents?.length ? (
                <div className="flex grow flex-col items-center gap-3 pt-20">
                  <div className="flex flex-col items-center gap-1">
                    <p className="font-medium">No available agents</p>
                    <p className="text-official-gray-400 text-center text-sm font-medium">
                      Create your first Agent to start exploring the power of
                      AI.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {agents?.map((agent) => (
                    <AgentCard
                      agentDescription={agent.ui_description}
                      agentId={agent.agent_id}
                      agentName={agent.name}
                      key={agent.agent_id}
                      llmProviderId={agent.llm_provider_id}
                      scheduledTasks={agent.cron_tasks}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    if (isAgentGenPromptLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <Card className="mx-auto w-full max-w-xl">
            <CardHeader className="flex flex-row items-start gap-4 pt-4">
              <Skeleton className="bg-official-gray-900 mt-3 size-10 shrink-0 rounded-full" />
              <CardTitle className="w-full text-lg">
                <div className="flex flex-col gap-2">
                  <Skeleton className="bg-official-gray-900 h-6 w-2/3 rounded" />
                </div>
                <Skeleton className="bg-official-gray-900 mt-2 h-10 w-3/4 rounded" />
              </CardTitle>
            </CardHeader>
            <ScrollArea className="h-[calc(80vh-130px)] pr-3">
              <CardContent>
                <div className="mb-6">
                  <h4 className="mb-2 flex items-center gap-2 font-semibold">
                    <Skeleton className="bg-official-gray-900 h-5 w-40 rounded" />
                  </h4>
                  <div className="bg-official-gray-900 h-[250px] rounded-lg p-4" />
                </div>
                <div className="mb-2">
                  <h4 className="mb-2 flex items-center gap-2 font-semibold">
                    <Skeleton className="bg-official-gray-900 h-5 w-32 rounded" />
                  </h4>
                  <ul className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton
                        className="bg-official-gray-900 ml-auto h-16 w-full rounded"
                        key={i}
                      />
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="mt-6 flex items-center justify-between">
                <Skeleton className="bg-official-gray-900 h-8 w-24 rounded-full" />
                <Skeleton className="bg-official-gray-900 h-10 w-32 rounded-full" />
              </CardFooter>
            </ScrollArea>
          </Card>
        </div>
      );
    }
    if (generatedAgent) {
      return (
        <div className="flex h-full items-center justify-center">
          <Card className="mx-auto w-full max-w-xl">
            <CardHeader className="flex flex-row items-start gap-4 pt-4">
              <AgentIcon className="mt-3 size-5" />
              <CardTitle className="text-lg">
                <div className="flex flex-col gap-2">
                  {formatText(generatedAgent.name)}
                </div>
                <p className="text-official-gray-400 text-sm font-normal">
                  {generatedAgent.indications}
                </p>
              </CardTitle>
            </CardHeader>
            <ScrollArea className="h-[calc(80vh-130px)] pr-3">
              <CardContent>
                <Accordion
                  defaultValue={['instructions', 'tools']}
                  type="multiple"
                >
                  <AccordionItem value="instructions">
                    <AccordionTrigger>
                      <h4 className="mb-2 flex items-center gap-2 font-semibold">
                        System Instructions
                      </h4>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-official-gray-850 rounded-lg border p-4">
                        <p className="whitespace-pre-wrap text-sm">
                          {generatedAgent.instructions}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="tools">
                    <AccordionTrigger>
                      <h4 className="mb-2 flex items-center gap-2 font-semibold">
                        <ToolsIcon className="h-4 w-4" />
                        Available Tools
                      </h4>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {generatedAgent.tools.map((tool) => (
                          <li
                            className="bg-official-gray-850 relative flex cursor-default items-center gap-2 rounded-lg border p-2 text-sm transition-colors"
                            key={tool.name}
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium">
                                  {formatText(tool.name)}
                                </span>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge
                                      className="ml-2 border bg-amber-900/40 px-1 py-0 text-xs font-medium tracking-normal text-amber-400"
                                      variant="secondary"
                                    >
                                      Simulated
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      This is a simulated tool preview -
                                      you&apos;ll need to build it
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <span className="text-official-gray-400 text-xs">
                                {tool.description}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </ScrollArea>
            <CardFooter className="flex justify-between gap-2 pt-2">
              <Button
                onClick={() => {
                  setGeneratedAgent(null);
                }}
                size="md"
                variant="outline"
              >
                <RefreshCcw className="h-4 w-4" />
                Restart
              </Button>
              <Button
                disabled={isCreating}
                isLoading={isCreating}
                onClick={() => {
                  if (!auth) return;
                  const agentIdToUse = generatedAgent.name
                    .replace(/[^a-zA-Z0-9_]/g, '_')
                    .toLowerCase();

                  createAgent({
                    nodeAddress: auth?.node_address ?? '',
                    token: auth?.api_v2_key ?? '',
                    agent: {
                      agent_id: agentIdToUse,
                      full_identity_name: `${auth?.shinkai_identity}/main/agent/${agentIdToUse}`,
                      llm_provider_id: defaultAI,
                      name: generatedAgent.name,
                      ui_description: generatedAgent.indications,
                      tools: [],
                      knowledge: [],
                      storage_path: '',
                      tools_config_override: {},
                      debug_mode: false,
                    },
                  });
                }}
                size="md"
              >
                Create Agent
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }
  };

  return (
    <div className="h-full">
      <div className="container flex h-full flex-col">{renderContent()}</div>
    </div>
  );
}

export default AgentsPage;

const hardcodedResponse = {
  result: {
    indications:
      'Helps users learn Spanish through vocabulary, grammar, and conversation practice.',
    instructions:
      "## Steps to assist Spanish learning:\n1. Assess the user's current Spanish proficiency.\n2. Provide vocabulary lists categorized by themes or difficulty.\n3. Explain grammar rules with examples.\n4. Create exercises for practice (e.g. fill-in-the-blanks, translations).\n5. Engage the user in simple conversational practice to improve speaking and comprehension.\n6. Offer corrections and explanations for mistakes.\n7. Recommend resources for further study.\n8. Adapt learning based on user progress and feedback.",
    name: 'SpanishLearningAssistant',
    tools: [
      {
        description:
          'Provides thematic Spanish vocabulary lists; input: theme or difficulty level; output: list of Spanish words with translations.',
        name: 'VocabularyTool',
      },
      {
        description:
          'Explains Spanish grammar rules with examples; input: grammar topic; output: explanation and examples.',
        name: 'GrammarTool',
      },
      {
        description:
          'Creates Spanish language exercises; input: exercise type and topic; output: interactive exercises for practice.',
        name: 'ExerciseGenerator',
      },
      {
        description:
          'Simulates Spanish conversation practice; input: user level and topic; output: conversational prompts and feedback.',
        name: 'ConversationSimulator',
      },
    ],
  },
};

const AGENTS_SUGGESTIONS = [
  {
    text: 'Spanish Learning Agent',
    prompt: 'Generate an AI Agent that can help me with my spanish learning',
  },
  {
    text: 'SEO Agent',
    prompt: 'Generate an AI Agent that can help me with my SEO',
  },
  {
    text: 'Social Media Agent',
    prompt: 'Generate an AI Agent that can help me with my social media',
  },
  {
    text: 'Content Generation Agent',
    prompt: 'Generate an AI Agent that can help me with my content generation',
  },
];

function sanitizeFileName(name: string): string {
  let sanitized = name.replace(/[^a-zA-Z0-9_]/g, '_');
  sanitized = sanitized.replace(/_+/g, '_');
  sanitized = sanitized.replace(/^_+|_+$/g, '');

  return sanitized || 'untitled_agent';
}

const AgentCard = ({
  agentId,
  agentName,
  // llmProviderId,
  agentDescription,
  scheduledTasks,
}: {
  agentId: string;
  agentName: string;
  llmProviderId: string;
  agentDescription: string;
  scheduledTasks?: RecurringTask[];
}) => {
  const { t } = useTranslation();
  const [isDeleteAgentDrawerOpen, setIsDeleteAgentDrawerOpen] =
    React.useState(false);
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();

  const { mutateAsync: exportAgent } = useExportAgent({
    onSuccess: async (response) => {
      const sanitizedAgentName = sanitizeFileName(agentName);
      const file = new Blob([response ?? ''], {
        type: 'application/octet-stream',
      });

      const arrayBuffer = await file.arrayBuffer();
      const content = new Uint8Array(arrayBuffer);

      const savePath = await save({
        defaultPath: `${sanitizedAgentName}.zip`,
        filters: [{ name: 'Zip File', extensions: ['zip'] }],
      });

      if (!savePath) {
        toast.info('File saving cancelled');
        return;
      }

      await fs.writeFile(savePath, content, {
        baseDir: BaseDirectory.Download,
      });

      toast.success('Agent exported successfully');
    },
    onError: (error) => {
      toast.error('Failed to export agent', {
        description: error.response?.data?.message ?? error.message,
      });
    },
  });

  const hasScheduledTasks =
    scheduledTasks?.length && scheduledTasks?.length > 0;

  return (
    <React.Fragment>
      <div className="border-official-gray-850 bg-official-gray-900 flex items-center justify-between gap-1 rounded-lg border p-3.5">
        <div className="flex items-start gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg">
            <AIAgentIcon />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="inline-flex w-full items-center gap-3 truncate text-start text-sm capitalize">
              {agentName}{' '}
              {scheduledTasks?.length && scheduledTasks?.length > 0 && (
                <Badge
                  className="border bg-emerald-900/40 px-1 py-0 text-xs font-medium text-emerald-400"
                  variant="secondary"
                >
                  Scheduled
                </Badge>
              )}
            </span>

            <span className="text-official-gray-400 text-sm">
              {agentDescription ?? 'No description'}
            </span>
            {hasScheduledTasks && (
              <div className="mt-2 inline-flex gap-2">
                {scheduledTasks.map((task) => (
                  <TooltipProvider delayDuration={0} key={task.task_id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          className="text-official-gray-200 bg-official-gray-850 flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors hover:text-white"
                          key={task.task_id}
                          to={`/tasks/${task.task_id}`}
                        >
                          <ScheduledTasksIcon className="h-3 w-3" />
                          <span>
                            {cronstrue.toString(task.cron, {
                              throwExceptionOnParseError: false,
                            })}
                          </span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent
                        align="center"
                        className="flex flex-col items-center gap-1"
                      >
                        Go to task details
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    navigate(`/home`, { state: { agentName: agentId } });
                  }}
                  size="sm"
                  variant="outline"
                >
                  <CreateAIIcon className="size-4" />
                  <span className=""> Chat</span>
                </Button>
              </TooltipTrigger>

              <TooltipPortal>
                <TooltipContent
                  align="center"
                  className="flex flex-col items-center gap-1"
                  side="right"
                >
                  Create New Chat
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
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
                    navigate(`/agents/edit/${agentId}`);
                  },
                },
                {
                  name: 'Export',
                  icon: <DownloadIcon className="mr-3 h-4 w-4" />,
                  onClick: () => {
                    exportAgent({
                      agentId,
                      nodeAddress: auth?.node_address ?? '',
                      token: auth?.api_v2_key ?? '',
                    });
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
      </div>
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
