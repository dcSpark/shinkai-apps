import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { z } from 'zod';

import { RootState, useTypedDispatch } from '../../store';
import { createInbox } from '../../store/inbox/inbox-actions';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';

const formSchema = z.object({
  receiverIdentity: z.string().nonempty(),
  message: z.string().nonempty(),
});

type CreateInboxFieldType = z.infer<typeof formSchema>;

export const CreateInbox = () => {
  const history = useHistory();
  const form = useForm<CreateInboxFieldType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      receiverIdentity: '',
      message: '',
    },
  });
  const isLoading = useSelector(
    (state: RootState) => state.inbox?.create?.status === 'loading'
  );
  const dispatch = useTypedDispatch();
  const node = useSelector((state: RootState) => state.node.data);
  const submit = (values: CreateInboxFieldType) => {
    dispatch(
      createInbox({
        receiverIdentity: values.receiverIdentity,
        message: values.message,
      })
    )
      .unwrap()
      .then((createdInbox) => {
        history.replace(
          `/inboxes/${encodeURIComponent(createdInbox.inbox.id)}`
        );
      })
      .catch(() => {
        console.log('error creating inbox');
      });
  };
  useEffect(() => {
    if (!node) {
      return;
    }
    const defaultReceiverIdentity = `${node.nodeData.shinkaiIdentity}/${node.nodeData.profile}/device/${node.userData.registrationName}`;
    form.setValue('receiverIdentity', defaultReceiverIdentity);
  }, [form, node]);
  return (
    <Form {...form}>
      <form
        className="p-1 h-full flex flex-col space-y-2 justify-between"
        onSubmit={form.handleSubmit(submit)}
      >
        <div className="grow flex flex-col space-y-2">
        <FormField
            control={form.control}
            name="receiverIdentity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <FormattedMessage id="message-receiver" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <FormattedMessage id="message.one" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          className="w-full"
          disabled={!form.formState.isValid || isLoading}
          type="submit"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <FormattedMessage id="connect" />
        </Button>
      </form>
    </Form>
  );
};
