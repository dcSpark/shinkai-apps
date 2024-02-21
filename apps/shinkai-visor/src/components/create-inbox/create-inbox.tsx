import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateChat } from '@shinkai_network/shinkai-node-state/lib/mutations/createChat/useCreateChat';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Textarea,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { z } from 'zod';

import { useAuth } from '../../store/auth/auth';
import { Header } from '../header/header';

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
    const { shinkai_identity, profile, registration_name } = auth ?? {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, identity] = shinkai_identity?.split('.') ?? [];
    const defaultReceiverIdentity = `@@${values.receiverIdentity}.${identity}/${profile}/device/${registration_name}`;

    const [receiver, ...rest] = defaultReceiverIdentity.split('/');
    createChat({
      nodeAddress: auth?.node_address ?? '',
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
    const receiverIdentity = auth.shinkai_identity.replace(/@/g, '');
    const [identity] = receiverIdentity.split('.');
    form.setValue('receiverIdentity', identity);
  }, [auth, form]);

  const endAdornment = auth
    ? `.${auth.shinkai_identity.split('.')[1]}/${auth.profile}`
    : '';
  return (
    <div className="flex h-full flex-col space-y-8">
      <Header title={<FormattedMessage id="create-inbox" />} />
      <Form {...form}>
        <form
          className="flex h-full flex-col justify-between space-y-2"
          onSubmit={form.handleSubmit(submit)}
        >
          <div className="flex grow flex-col space-y-2">
            <FormField
              control={form.control}
              name="receiverIdentity"
              render={({ field }) => (
                <TextField
                  endAdornment={endAdornment}
                  field={field}
                  label={<FormattedMessage id="message-receiver" />}
                  startAdornment={'@@'}
                />
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
                      className="resize-none"
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' &&
                          (event.metaKey || event.ctrlKey)
                        ) {
                          form.handleSubmit(submit)();
                        }
                      }}
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
            isLoading={isPending}
            type="submit"
          >
            <FormattedMessage id="create-inbox" />
          </Button>
        </form>
      </Form>
    </div>
  );
};
