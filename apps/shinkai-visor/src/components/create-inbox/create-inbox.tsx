import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateChat } from '@shinkai_network/shinkai-node-state/lib/mutations/createChat/useCreateChat';
import { Loader2, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { z } from 'zod';

import { useAuth } from '../../store/auth/auth';
import { Header } from '../header/header';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  receiverIdentity: z.string().nonempty(),
  message: z.string().nonempty(),
});

type FormSchemaType = z.infer<typeof formSchema>;

export const CreateInbox = () => {
  const history = useHistory();
  const auth = useAuth((state) => state.auth);
  const intl = useIntl();
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      receiverIdentity: '',
      message: '',
    },
  });
  const { isPending, mutateAsync: createChat } = useCreateChat({
    onSuccess: (data) => {
      history.replace(`/inboxes/${encodeURIComponent(data.inboxId)}`);
    },
  });
  const submit = (values: FormSchemaType) => {
    if (!auth) return;
    const [receiver, ...rest] = values.receiverIdentity.split('/');
    createChat({
      sender: auth.shinkai_identity,
      senderSubidentity: auth.profile,
      receiver,
      receiverSubidentity: rest.join('/'),
      message: values.message,
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
    });
  };

  useEffect(() => {
    if (!auth) {
      return;
    }
    const defaultReceiverIdentity = `${auth.shinkai_identity}/${auth.profile}/device/${auth.registration_name}`;
    form.setValue('receiverIdentity', defaultReceiverIdentity);
  }, [auth, form]);

  return (
    <div className="h-full flex flex-col space-y-3">
      <Header
        icon={<MessageCircle />}
        title={<FormattedMessage id="create-inbox"></FormattedMessage>}
      ></Header>
      <Form {...form}>
        <form
          className="h-full flex flex-col space-y-2 justify-between"
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
                    <Textarea
                      autoFocus
                      className="resize-none border-white"
                      placeholder={intl.formatMessage({
                        id: 'tmwtd',
                      })}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            className="w-full"
            disabled={!form.formState.isValid || isPending}
            type="submit"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle className="mr-2 h-4 w-4"></MessageCircle>
            )}
            <FormattedMessage id="create-inbox" />
          </Button>
        </form>
      </Form>
    </div>
  );
};
