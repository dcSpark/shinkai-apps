import { zodResolver } from '@hookform/resolvers/zod';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import {
  EditAgentFormSchema,
  editAgentSchema,
} from '@shinkai_network/shinkai-node-state/forms/agents/edit-agent';
import { useDeleteAgent } from '@shinkai_network/shinkai-node-state/lib/mutations/deleteAgent/useDeleteAgent';
import { useUpdateAgent } from '@shinkai_network/shinkai-node-state/lib/mutations/updateAgent/useUpdateAgent';
import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import {
  Badge,
  Button,
  buttonVariants,
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Form,
  FormField,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { ScrollArea } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { BotIcon, Edit, Plus, TrashIcon } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth/auth';
import { EmptyAgents } from '../empty-agents/empty-agents';
import { getModelObject } from './add-agent';

export const Agents = () => {
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
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
    navigate('/agents/add');
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
                  agentApiKey={agent.api_key ?? ''}
                  agentId={agent.id}
                  externalUrl={agent.external_url ?? ''}
                  key={agent.id}
                  model={agent.model}
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
  agentId,
  model,
  externalUrl,
  agentApiKey,
}: {
  agentId: string;
  model: string;
  externalUrl: string;
  agentApiKey: string;
}) {
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
          navigate('/inboxes/create-job', { state: { agentName: agentId } });
        }}
        role="button"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg ">
            <BotIcon className="h-6 w-6" />
          </div>
          <div className="flex flex-col items-baseline gap-2">
            <span className="w-full truncate text-start text-sm">
              {agentId}
            </span>
            <Badge className="text-gray-80 truncate bg-gray-400 text-start text-xs font-normal shadow-none">
              {model}
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
                name: 'Edit',
                icon: <Edit className="mr-3 h-4 w-4" />,
                onClick: () => {
                  setIsEditAgentDrawerOpen(true);
                },
              },
              {
                name: 'Delete',
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
      <EditAgentDrawer
        agentApiKey={agentApiKey}
        agentExternalUrl={externalUrl}
        agentId={agentId}
        agentModelProvider={model.split(':')[0]}
        agentModelType={model.split(':')[1]}
        onOpenChange={setIsEditAgentDrawerOpen}
        open={isEditAgentDrawerOpen}
      />
      <RemoveAgentDrawer
        agentId={agentId}
        onOpenChange={setIsDeleteAgentDrawerOpen}
        open={isDeleteAgentDrawerOpen}
      />
    </React.Fragment>
  );
}

const EditAgentDrawer = ({
  open,
  onOpenChange,
  agentId,
  agentModelProvider,
  agentModelType,
  agentExternalUrl,
  agentApiKey,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  agentModelProvider: string;
  agentModelType: string;
  agentExternalUrl: string;
  agentApiKey: string;
}) => {
  const auth = useAuth((state) => state.auth);

  const form = useForm<EditAgentFormSchema>({
    resolver: zodResolver(editAgentSchema),
  });

  useEffect(() => {
    form.reset({
      agentName: agentId,
      externalUrl: agentExternalUrl,
      apikey: agentApiKey,
      modelCustom: agentModelProvider,
      modelTypeCustom: agentModelType,
    });
  }, [
    agentId,
    agentModelProvider,
    agentModelType,
    agentExternalUrl,
    agentApiKey,
  ]);

  const { mutateAsync: updateAgent, isPending } = useUpdateAgent({
    onSuccess: () => {
      onOpenChange(false);
      toast.success('AI updated successfully');
    },
    onError: (error) => {
      toast.error('Error updating agent', {
        description: typeof error === 'string' ? error : error.message,
      });
    },
  });

  const submit = async (values: EditAgentFormSchema) => {
    if (!auth) return;
    const model = getModelObject(values.modelCustom, values.modelTypeCustom);

    await updateAgent({
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      profile: auth?.profile ?? '',
      agent: {
        allowed_message_senders: [],
        api_key: values.apikey,
        external_url: values.externalUrl,
        full_identity_name: `${auth.shinkai_identity}/${auth.profile}/agent/${agentId}`,
        id: agentId,
        perform_locally: false,
        storage_bucket_permissions: [],
        toolkit_permissions: [],
        model,
      },
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
    });
  };

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent>
        <DrawerHeader className="mb-6">
          <DrawerTitle className="font-normal">
            Update <span className="font-medium">{agentId}</span>{' '}
          </DrawerTitle>
        </DrawerHeader>
        <Form {...form}>
          <form
            className="flex h-full flex-col justify-between space-y-6"
            onSubmit={form.handleSubmit(submit)}
          >
            <div className="flex grow flex-col space-y-3">
              <FormField
                control={form.control}
                disabled
                name="agentName"
                render={({ field }) => (
                  <TextField
                    field={field}
                    label={<FormattedMessage id="agent-name" />}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="externalUrl"
                render={({ field }) => (
                  <TextField
                    field={field}
                    label={<FormattedMessage id="external-url" />}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="apikey"
                render={({ field }) => (
                  <TextField
                    field={field}
                    label={<FormattedMessage id="api-key" />}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="modelCustom"
                render={({ field }) => (
                  <TextField field={field} label={'Model Name'} />
                )}
              />
              <FormField
                control={form.control}
                name="modelTypeCustom"
                render={({ field }) => (
                  <TextField field={field} label={'Model ID'} />
                )}
              />
            </div>
            <Button
              className="w-full"
              disabled={isPending}
              isLoading={isPending}
              type="submit"
            >
              Save
            </Button>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
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
  const auth = useAuth((state) => state.auth);
  const { mutateAsync: deleteAgent, isPending } = useDeleteAgent({
    onSuccess: () => {
      onOpenChange(false);
      toast.success('AI deleted successfully');
    },
    onError: (error) => {
      toast.error('Error deleting agent', {
        description: typeof error === 'string' ? error : error.message,
      });
    },
  });

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="font-normal">
            Delete AI
            <span className="font-medium">{agentId}</span>{' '}
          </DrawerTitle>
        </DrawerHeader>
        <p className="text-gray-80 my-3 text-base">
          Are you sure you want to delete this agent? This action cannot be
          undone.
        </p>
        <DrawerFooter>
          <Button
            className="mt-4"
            isLoading={isPending}
            onClick={async () => {
              if (!auth) return;
              await deleteAgent({
                nodeAddress: auth?.node_address ?? '',
                shinkaiIdentity: auth?.shinkai_identity ?? '',
                profile: auth?.profile ?? '',
                agentId,
                my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
                my_device_identity_sk: auth?.profile_identity_sk ?? '',
                node_encryption_pk: auth?.node_encryption_pk ?? '',
                profile_encryption_sk: auth?.profile_encryption_sk ?? '',
                profile_identity_sk: auth?.profile_identity_sk ?? '',
              });
            }}
            variant="destructive"
          >
            Delete
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
