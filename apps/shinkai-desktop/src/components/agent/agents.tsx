import { DialogClose } from '@radix-ui/react-dialog';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useRemoveAgent } from '@shinkai_network/shinkai-node-state/v2/mutations/removeAgent/useRemoveAgent';
import { useGetAgents } from '@shinkai_network/shinkai-node-state/v2/queries/getAgents/useGetAgents';
import {
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
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { AIAgentIcon, CreateAIIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Edit, Plus, TrashIcon } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth';

function Agents() {
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const { data: agents } = useGetAgents({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  return (
    <div className="flex h-full flex-col space-y-3">
      <div className="absolute right-3 top-0">
        <Button
          className="px-4"
          onClick={() => {
            navigate('/add-agent');
          }}
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>Add Agent</span>
        </Button>
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

          <Button
            className="px-4"
            onClick={() => {
              navigate('/add-agent');
            }}
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Agent</span>
          </Button>
        </div>
      ) : (
        <ScrollArea className="flex h-full flex-col justify-between [&>div>div]:!block">
          <div className="divide-y divide-gray-400">
            {agents?.map((agent) => (
              <AgentCard
                agentDescription={agent.ui_description}
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

const AgentCard = ({
  agentId,
  agentName,
  // llmProviderId,
  agentDescription,
}: {
  agentId: string;
  agentName: string;
  llmProviderId: string;
  agentDescription: string;
}) => {
  const { t } = useTranslation();
  const [isDeleteAgentDrawerOpen, setIsDeleteAgentDrawerOpen] =
    React.useState(false);

  const navigate = useNavigate();

  return (
    <React.Fragment>
      <div className="flex cursor-pointer items-center justify-between gap-1 rounded-lg py-3.5 pr-2.5 hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-400">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg">
            <AIAgentIcon />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="w-full truncate text-start text-sm">
              {agentName}{' '}
            </span>

            <span className="text-gray-80 text-xs">
              {agentDescription ?? 'No description'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    navigate(`/inboxes`, { state: { agentName: agentId } });
                  }}
                  size="sm"
                  variant="gradient"
                >
                  <CreateAIIcon className="size-4" />
                  <span className="sr-only">New Chat</span>
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
