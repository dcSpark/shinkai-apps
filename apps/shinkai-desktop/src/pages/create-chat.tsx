import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
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

import { useAuth } from '../store/auth';
import { SubpageLayout } from './layout/simple-layout';

const CreateChatPage = () => {
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { isPending, mutateAsync: createChat } = useCreateChat({
    onSuccess: (data) => {
      // TODO: job_inbox, false is hardcoded
      navigate(`/inboxes/${encodeURIComponent(data.inboxId)}`);
    },
  });

  const createChatForm = useForm<CreateDMFormSchema>({
    resolver: zodResolver(createDMFormSchema),
  });

  const onSubmit = async (data: CreateDMFormSchema) => {
    if (!auth) return;
    const [receiver, ...rest] = data.receiverIdentity.split('/');

    await createChat({
      nodeAddress: auth?.node_address ?? '',
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
    <SubpageLayout title={t('chatDM.create')}>
      <Form {...createChatForm}>
        <form
          className="space-y-10"
          onSubmit={createChatForm.handleSubmit(onSubmit)}
        >
          <div className="space-y-6">
            <FormField
              control={createChatForm.control}
              name="receiverIdentity"
              render={({ field }) => (
                <TextField
                  field={field}
                  label={t('chatDM.form.shinkaiIdentity')}
                />
              )}
            />
            <FormField
              control={createChatForm.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('chatDM.form.message')}</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-nonee"
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' &&
                          (event.metaKey || event.ctrlKey)
                        ) {
                          createChatForm.handleSubmit(onSubmit)();
                        }
                      }}
                      placeholder={t('chatDM.form.messagePlaceholder')}
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
            {t('chatDM.create')}
          </Button>
        </form>
      </Form>
    </SubpageLayout>
  );
};
export default CreateChatPage;
