import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateInboxName } from '@shinkai_network/shinkai-node-state/lib/mutations/updateInboxName/useUpdateInboxName';
import { Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { z } from 'zod';

import { useAuth } from '../../store/auth/auth';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';

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
    onSuccess: (data) => {
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
            <span className="lowercase">
              <FormattedMessage id="inbox.one" />
            </span>
          </DialogTitle>
          <DialogDescription className="truncate">{inboxId}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="h-full flex flex-col space-y-3 justify-between"
            onSubmit={form.handleSubmit(submit)}
          >
            <div className="grow flex flex-col space-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <FormattedMessage id="name.one" />
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <div className="flex flex-col justify-between space-y-2">
                <Button disabled={isPending} type="submit">
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4"></Save>
                  )}
                  <FormattedMessage id="save" />
                </Button>
                <Button
                  className="text-secondary-600"
                  onClick={() => cancel()}
                  type="button"
                  variant="outline"
                >
                  <FormattedMessage id="cancel"></FormattedMessage>
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
