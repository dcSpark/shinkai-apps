import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  UpdateInboxNameFormSchema,
  updateInboxNameFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/inbox';
import { useUpdateInboxName } from '@shinkai_network/shinkai-node-state/v2/mutations/updateInboxName/useUpdateInboxName';
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

import { useAuth } from '../../store/auth/auth';

export type EditInboxNameDialogProps = {
  open: boolean;
  onCancel: () => void;
  onSaved: (name: string) => void;
  inboxId: string;
  name: string;
  onOpenChange: (open: boolean) => void;
};

export const EditInboxNameDialog = ({
  open,
  name,
  onCancel,
  onSaved,
  inboxId,
  onOpenChange,
}: EditInboxNameDialogProps) => {
  const { t } = useTranslation();
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
      token: auth?.api_v2_key ?? '',
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
            {t('common.edit')} <span className="mr-1 capitalize">Chat</span>
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
                    label={t('inboxes.inboxName')}
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
                  {t('common.cancel')}
                </Button>
                <Button
                  className="flex-1"
                  disabled={isPending}
                  isLoading={isPending}
                  type="submit"
                >
                  {t('common.save')}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
};
