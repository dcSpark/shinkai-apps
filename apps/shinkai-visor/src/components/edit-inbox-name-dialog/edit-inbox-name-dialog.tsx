import { zodResolver } from '@hookform/resolvers/zod';
import { AgentInbox } from '@shinkai_network/shinkai-message-ts/models';
import {
  UpdateInboxNameFormSchema,
  updateInboxNameFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/inbox';
import { useUpdateInboxName } from '@shinkai_network/shinkai-node-state/lib/mutations/updateInboxName/useUpdateInboxName';
import {
  Button,
  DialogFooter,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  Form,
  FormField,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';

import { useAuth } from '../../store/auth/auth';

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
