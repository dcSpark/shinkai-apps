import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { useUpdateAgent } from '@shinkai_network/shinkai-node-state/lib/mutations/updateAgent/useUpdateAgent';
import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import {
  AgentIcon,
  Badge,
  Button,
  buttonVariants,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shinkai_network/shinkai-ui';
import { ScrollArea } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { CopyIcon, FileInputIcon, Plus, TrashIcon } from 'lucide-react';
import React, { Fragment } from 'react';
import { useHistory } from 'react-router-dom';

import { useAuth } from '../../store/auth/auth';
import { EmptyAgents } from '../empty-agents/empty-agents';

export const Agents = () => {
  const auth = useAuth((state) => state.auth);
  const history = useHistory();
  const { agents } = useAgents({
    nodeAddress: auth?.node_address ?? '',
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: `${auth?.profile}`,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });
  const onAddAgentClick = () => {
    history.push('/agents/add');
  };
  return (
    <div className="flex h-full flex-col space-y-3">
      {!agents?.length ? (
        <div className="flex h-full flex-col justify-center">
          <EmptyAgents data-testid="empty-agents" />
        </div>
      ) : (
        <>
          <ScrollArea className="flex h-full flex-col justify-between [&>div>div]:!block">
            <div className="divide-y divide-gray-400">
              {agents?.map((agent) => (
                <AgentCard
                  externalUrl={agent.external_url}
                  key={agent.id}
                  model={agent.model}
                  name={agent.id}
                />
              ))}
            </div>
          </ScrollArea>
          <div className="fixed bottom-4 right-4">
            <Button
              className="h-[60px] w-[60px]"
              data-testid="add-agent-button"
              onClick={onAddAgentClick}
              size="icon"
            >
              <Plus className="h-7 w-7" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

function AgentCard({
  name,
  model,
  externalUrl,
}: {
  name: string;
  model: string;
  externalUrl: string;
}) {
  const auth = useAuth((state) => state.auth);
  const { mutateAsync: updateAgent } = useUpdateAgent();

  return (
    <div
      className="flex items-center justify-between gap-1 rounded-lg py-3.5 pr-2.5 hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-400"
      data-testid={`${name}-agent-button`}
    >
      <div>
        <div className="flex items-center gap-2">
          <AgentIcon className="mr-2 h-4 w-4" />
          <span className="w-full truncate text-start text-base">{name}</span>
        </div>
        <div className="flex gap-1">
          <Badge variant="outline">{model}</Badge>
          <Badge>{externalUrl}</Badge>
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
            <span className="sr-only">More options</span>
            <DotsVerticalIcon className="text-gray-100" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[160px] border bg-gray-500 px-2.5 py-2"
        >
          {[
            {
              name: 'Move',
              icon: <FileInputIcon className="mr-3 h-4 w-4" />,
              onClick: async () => {
                if (!auth) return;
                await updateAgent({
                  nodeAddress: auth?.node_address ?? '',
                  shinkaiIdentity: auth?.shinkai_identity ?? '',
                  profile: auth?.profile ?? '',
                  agent: {
                    allowed_message_senders: [],
                    api_key: 'sk-wwww',
                    external_url: 'https://',
                    full_identity_name: `${auth.shinkai_identity}/${auth.profile}/agent/${agentName}`,
                    id: agentName,
                    perform_locally: false,
                    storage_bucket_permissions: [],
                    toolkit_permissions: [],
                    model,
                  },
                  my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
                  my_device_identity_sk: auth?.profile_identity_sk ?? '',
                  node_encryption_pk: auth?.node_encryption_pk ?? '',
                  profile_encryption_sk: auth?.profile_encryption_sk ?? '',
                  profile_identity_sk: auth?.profile_identity_sk ?? '',
                });
              },
            },
            {
              name: 'Copy',
              icon: <CopyIcon className="mr-3 h-4 w-4" />,
              onClick: () => {},
            },
            {
              name: 'Delete',
              icon: <TrashIcon className="mr-3 h-4 w-4" />,
              onClick: () => {},
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
  );
}
