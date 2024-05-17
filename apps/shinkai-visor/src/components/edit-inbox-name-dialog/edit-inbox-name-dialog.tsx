import { zodResolver } from '@hookform/resolvers/zod';
import { AgentInbox } from '@shinkai_network/shinkai-message-ts/models';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils';
import {
  UpdateInboxNameFormSchema,
  updateInboxNameFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/inbox';
import { useUpdateAgentInJob } from '@shinkai_network/shinkai-node-state/lib/mutations/updateAgentInJob/useUpdateAgentInJob';
import { useUpdateInboxName } from '@shinkai_network/shinkai-node-state/lib/mutations/updateInboxName/useUpdateInboxName';
import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import {
  Badge,
  Button,
  DialogFooter,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Form,
  FormField,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { AgentIcon } from '@shinkai_network/shinkai-ui/assets';
import { ChevronDown } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { toast } from 'sonner';

import { useGetCurrentInbox } from '../../hooks/use-current-inbox';
import { useAuth } from '../../store/auth/auth';

function AgentSelection() {
  const auth = useAuth((state) => state.auth);
  const currentInbox = useGetCurrentInbox();
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

  const { mutateAsync: updateAgentInJob } = useUpdateAgentInJob({
    onError: (error) => {
      toast.error('Failed to update agent', {
        description: error.message,
      });
    },
  });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge className="hover:bg-gray-350 inline-flex cursor-pointer items-center gap-3 self-start truncate rounded-xl bg-gray-300 px-1.5 py-1 text-start text-xs font-normal text-gray-50 shadow-none hover:text-white [&[data-state=open]>svg]:rotate-180">
          <div className="flex items-center gap-1">
            <AgentIcon className="h-4 w-4" />
            <span>{currentInbox?.agent?.id}</span>
          </div>
          <ChevronDown className="h-3 w-3" />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-[300px] w-[300px] overflow-y-auto bg-gray-300 p-1 py-2"
      >
        <DropdownMenuRadioGroup
          onValueChange={async (value) => {
            const jobId = extractJobIdFromInbox(currentInbox?.inbox_id ?? '');
            await updateAgentInJob({
              nodeAddress: auth?.node_address ?? '',
              shinkaiIdentity: auth?.shinkai_identity ?? '',
              profile: auth?.profile ?? '',
              jobId: jobId,
              newAgentId: value,
              my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
              my_device_identity_sk: auth?.profile_identity_sk ?? '',
              node_encryption_pk: auth?.node_encryption_pk ?? '',
              profile_encryption_sk: auth?.profile_encryption_sk ?? '',
              profile_identity_sk: auth?.profile_identity_sk ?? '',
            });
          }}
          value={currentInbox?.agent?.id ?? ''}
        >
          {agents.map((agent) => (
            <DropdownMenuRadioItem
              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-white transition-colors hover:bg-gray-200 aria-checked:bg-gray-200"
              key={agent.id}
              value={agent.id}
            >
              <AgentIcon className="h-4 w-4" />
              <div className="flex flex-col gap-1">
                <span className="text-xs">{agent.id}</span>
                {/*<span className="text-gray-80 text-xs">{agent.model}</span>*/}
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export type EditInboxNameDialogProps = {
  open: boolean;
  onCancel: () => void;
  onSaved: (name: string) => void;
  inboxId: string;
  name: string;
  onOpenChange: (open: boolean) => void;
  currentAgent?: AgentInbox;
};

export const EditInboxNameDialog = ({
  open,
  name,
  onCancel,
  onSaved,
  inboxId,
  onOpenChange,
  currentAgent,
}: EditInboxNameDialogProps) => {
  const auth = useAuth((state) => state.auth);
  const form = useForm<UpdateInboxNameFormSchema>({
    resolver: zodResolver(updateInboxNameFormSchema),
    defaultValues: {
      name: '',
    },
  });
  const { mutateAsync: updateInboxName, isPending } = useUpdateInboxName({
    onSuccess: () => {
      onSaved(form.getValues().name);
    },
  });
  const cancel = () => {
    onCancel();
  };
  const submit = (values: UpdateInboxNameFormSchema) => {
    updateInboxName({
      nodeAddress: auth?.node_address ?? '',
      sender: auth?.shinkai_identity ?? '',
      senderSubidentity: auth?.profile ?? '',
      receiver: auth?.shinkai_identity ?? '',
      my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
      my_device_identity_sk: auth?.my_device_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
      inboxId: inboxId,
      inboxName: values.name,
    });
  };
  useEffect(() => {
    form.setValue('name', name);
  }, [name, form]);
  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent>
        <DrawerHeader className="mb-6">
          <DrawerTitle>
            <FormattedMessage id="edit" />{' '}
            <span className="mr-1 capitalize">
              <FormattedMessage id="inbox.one" />
            </span>
            Name
          </DrawerTitle>
        </DrawerHeader>
        <div className="mb-4 flex justify-between text-sm">
          <span className="text-gray-80 flex">Current AI Agent</span>
          <AgentSelection />
        </div>
        <Form {...form}>
          <form
            className="flex h-full flex-col justify-between space-y-3"
            onSubmit={form.handleSubmit(submit)}
          >
            <div className="flex grow flex-col space-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <TextField
                    autoFocus
                    field={field}
                    label={<FormattedMessage id="name.one" />}
                  />
                )}
              />
            </div>
            <DialogFooter>
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={cancel}
                  type="button"
                  variant="ghost"
                >
                  <FormattedMessage id="cancel" />
                </Button>
                <Button
                  className="flex-1"
                  disabled={isPending}
                  isLoading={isPending}
                  type="submit"
                >
                  <FormattedMessage id="save" />
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
};
