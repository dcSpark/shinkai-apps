import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateInboxName } from '@shinkai_network/shinkai-node-state/lib/mutations/updateInboxName/useUpdateInboxName';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@shinkai_network/shinkai-ui';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { z } from 'zod';

import { useAuth } from '../../store/auth/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export type EditInboxNameDialogProps = {
  open: boolean;
  onCancel: () => void;
  onSaved: (name: string) => void;
  inboxId: string;
  name: string;
};

const formSchema = z.object({
  name: z.string().min(6),
});

type FormSchemaType = z.infer<typeof formSchema>;

export const EditInboxNameDialog = ({
  open,
  name,
  onCancel,
  onSaved,
  inboxId,
}: EditInboxNameDialogProps) => {
  const auth = useAuth((state) => state.auth);
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
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
  const submit = (values: FormSchemaType) => {
    updateInboxName({
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
    <Dialog open={open}>
      <DialogContent className="w-[75%]">
        <DialogHeader className="overflow-x-hidden">
          <DialogTitle>
            <FormattedMessage id="edit" />{' '}
            <span className="mr-1 capitalize">
              <FormattedMessage id="inbox.one" />
            </span>
            Name
          </DialogTitle>
          <DialogDescription className="truncate">{inboxId}</DialogDescription>
        </DialogHeader>

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
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormLabel>
                      <FormattedMessage id="name.one" />
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <div className="flex flex-col gap-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={cancel}
                  type="button"
                  variant="ghost"
                >
                  <FormattedMessage id="cancel"></FormattedMessage>
                </Button>
                <Button className="flex-1" disabled={isPending} type="submit">
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  <FormattedMessage id="save" />
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
