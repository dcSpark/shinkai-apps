import { DialogClose } from '@radix-ui/react-dialog';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { type RecurringTask } from '@shinkai_network/shinkai-message-ts/api/recurring-tasks/types';
import { useExportAgent } from '@shinkai_network/shinkai-node-state/v2/mutations/exportAgent/useExportAgent';
import { useRemoveAgent } from '@shinkai_network/shinkai-node-state/v2/mutations/removeAgent/useRemoveAgent';
import { useGetAgents } from '@shinkai_network/shinkai-node-state/v2/queries/getAgents/useGetAgents';
import {
  Badge,
  Button,
  buttonVariants,
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
  SearchInput,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  AIAgentIcon,
  CreateAIIcon,
  ScheduledTasksIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { save } from '@tauri-apps/plugin-dialog';
import * as fs from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/plugin-fs';
import cronstrue from 'cronstrue';
import { DownloadIcon, Edit, Plus, TrashIcon } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';

import ImportAgentModal from '../components/agent/import-agent-modal';
import { useAuth } from '../store/auth';

function AgentsPage() {
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const { data: agents } = useGetAgents({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = useMemo(() => {
    return agents?.filter((agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [agents, searchQuery]);

  return (
    <div className="h-full">
      <div className="container flex flex-col">
        <div className="flex flex-col gap-1 pb-6 pt-10">
          <div className="flex justify-between gap-4">
            <h1 className="font-clash text-3xl font-medium">Agents</h1>
            <div className="flex gap-2">
              <ImportAgentModal />
              <Button
                className="min-w-[100px]"
                onClick={() => {
                  void navigate('/add-agent');
                }}
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Agent</span>
              </Button>
            </div>
          </div>
          <p className="text-official-gray-400 text-sm">
            Create and explore AI agents with personalized instructions,
            enriched knowledge, <br /> diverse task capabilities, and more to
            tackle your goals autonomously.
          </p>
        </div>
        <SearchInput
          classNames={{
            container: 'w-full mb-4',
          }}
          onChange={(e) => setSearchQuery(e.target.value)}
          value={searchQuery}
        />
        <div className="flex flex-1 flex-col space-y-3 pb-10">
          {!filteredAgents?.length ? (
            <div className="flex grow flex-col items-center gap-3 pt-20">
              <div className="bg-official-gray-800 flex size-10 items-center justify-center rounded-lg p-2">
                <AIAgentIcon className="size-full" name={''} />
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="font-medium">No available agents</p>
                <p className="text-official-gray-400 text-center text-sm font-medium">
                  Create your first Agent to start exploring the power of AI.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredAgents?.map((agent) => (
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

export default AgentsPage;

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
            <AIAgentIcon name={agentName} size="sm" />
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
                    void navigate(`/home`, { state: { agentName: agentId } });
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
                    void navigate(`/agents/edit/${agentId}`);
                  },
                },
                {
                  name: 'Export',
                  icon: <DownloadIcon className="mr-3 h-4 w-4" />,
                  onClick: () => {
                    void exportAgent({
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
