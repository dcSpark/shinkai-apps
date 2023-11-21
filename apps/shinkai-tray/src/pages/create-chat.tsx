import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateChat } from '@shinkai_network/shinkai-node-state/lib/mutations/createChat/useCreateChat';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../store/auth';
import SimpleLayout from './layout/simple-layout';

const createChatSchema = z.object({
  receiver: z.string(),
  message: z.string().min(1, 'Message cannot be empty'),
});

const CreateChatPage = () => {
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();

  const { isPending, mutateAsync: createChat } = useCreateChat({
    onSuccess: (data) => {
      // TODO: job_inbox, false is hardcoded
      navigate(`/inboxes/${encodeURIComponent(data.inboxId)}`);
    },
  });

  const createChatForm = useForm<z.infer<typeof createChatSchema>>({
    resolver: zodResolver(createChatSchema),
  });

  const onSubmit = async (data: z.infer<typeof createChatSchema>) => {
    if (!auth) return;
    const [receiver, ...rest] = data.receiver.split('/');

    createChat({
      sender: auth.shinkai_identity,
      senderSubidentity: `${auth.profile}/device/${auth.registration_name}`,
      receiver,
      receiverSubidentity: rest.join('/'),
      message: data.message,
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
    });
  };
  return (
    <SimpleLayout title="Create Chat">
      <Form {...createChatForm}>
        <form
          className="space-y-10"
          onSubmit={createChatForm.handleSubmit(onSubmit)}
        >
          <div className="space-y-6">
            <FormField
              control={createChatForm.control}
              name="receiver"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shinkai Identity</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Eg: @@name.shinkai or @@name.shinkai/profile"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={createChatForm.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none border-white"
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' &&
                          (event.metaKey || event.ctrlKey)
                        ) {
                          createChatForm.handleSubmit(onSubmit)();
                        }
                      }}
                      placeholder="Enter your message"
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
            disabled={isPending}
            isLoading={isPending}
            type="submit"
          >
            Create Chat
          </Button>
        </form>
      </Form>
    </SimpleLayout>
  );
};
export default CreateChatPage;
