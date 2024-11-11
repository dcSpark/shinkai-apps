import { DialogClose } from '@radix-ui/react-dialog';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
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
  ScrollArea,
} from '@shinkai_network/shinkai-ui';
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
          <Plus className="h-4 w-4" />
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
