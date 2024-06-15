import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateDMFormSchema,
  createDMFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/create-dm';
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
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../store/auth/auth';

export const CreateInbox = () => {
  const navigate = useNavigate();
  const auth = useAuth((state) => state.auth);

  const form = useForm<CreateDMFormSchema>({
    resolver: zodResolver(createDMFormSchema),
    defaultValues: {
      receiverIdentity: '',
      message: '',
    },
  });
  const { isPending, mutateAsync: createChat } = useCreateChat({
    onSuccess: (data) => {
      navigate(`/inboxes/${encodeURIComponent(data.inboxId)}`);
    },
  });
  const submit = (values: CreateDMFormSchema) => {
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

  const endAdornment = auth
    ? `.${auth.shinkai_identity.split('.')[1]}/${auth.profile}`
    : '';
  return (
    <div className="flex h-full flex-col space-y-8">
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
                  label="Message receiver"
                  startAdornment={'@@'}
                />
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
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
                      placeholder="Tell me what to do"
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
            Create DM Chat
          </Button>
        </form>
      </Form>
    </div>
  );
};
