import { ErrorMessage } from '@hookform/error-message';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IonBackButton,
  IonButtons,
  IonCol,
  IonGrid,
  IonInput,
  IonLabel,
  IonPage,
  IonRow,
  IonTextarea,
  IonTitle,
} from '@ionic/react';
import { useCreateChat } from '@shinkai_network/shinkai-node-state/lib/mutations/createChat/useCreateChat';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import z from 'zod';

import Button from '../components/ui/Button';
import { IonContentCustom, IonHeaderCustom } from '../components/ui/Layout';
import { useAuth } from '../store/auth';

const createChatSchema = z.object({
  receiver: z.string(),
  message: z.string().min(1, 'Message cannot be empty'),
});

const CreateChat: React.FC = () => {
  const history = useHistory();
  const auth = useAuth((state) => state.auth);

  const { isPending, mutateAsync: createChat } = useCreateChat({
    onSuccess: (data) => {
      // Hacky solution because react-router can't handle dots in the URL
      const encodedInboxId = data.inboxId.toString().replace(/\./g, '~');
      history.push(`/chat/${encodeURIComponent(encodedInboxId)}`);
    },
  });
  const createChatForm = useForm<z.infer<typeof createChatSchema>>({
    resolver: zodResolver(createChatSchema),
  });
  const onSubmit = async (data: z.infer<typeof createChatSchema>) => {
    if (!auth) return;
    const [receiver, ...rest] = data.receiver.split('/');

    await createChat({
      nodeAddress: auth.node_address,
      sender: auth.shinkai_identity,
      senderSubidentity: auth.profile,
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
    <IonPage>
      <IonHeaderCustom>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/home" />
        </IonButtons>
        <IonTitle>Create Chat</IonTitle>
      </IonHeaderCustom>
      <IonContentCustom>
        <IonGrid
          className={
            'md:rounded-[1.25rem] bg-white dark:bg-slate-800 p-4 md:p-10 space-y-2 md:space-y-4'
          }
        >
          <IonRow>
            <IonCol>
              <h2 className={'text-lg mb-3 md:mb-8 text-center'}>
                New Chat Details
              </h2>
              <form
                className="space-y-10"
                onSubmit={createChatForm.handleSubmit(onSubmit)}
              >
                <div className="space-y-6">
                  <Controller
                    control={createChatForm.control}
                    name="receiver"
                    render={({ field }) => (
                      <div>
                        <IonLabel>Enter Shinkai Identity</IonLabel>
                        <IonInput
                          onIonChange={(e) =>
                            createChatForm.setValue(
                              'receiver',
                              e.detail.value as string
                            )
                          }
                          placeholder="@@name.shinkai or @@name.shinkai/profile"
                          value={field.value}
                        />
                        <ErrorMessage
                          errors={createChatForm.formState.errors}
                          name="receiver"
                          render={({ message }) => (
                            <p className="text-red-500">{message}</p>
                          )}
                        />
                      </div>
                    )}
                  />
                  <Controller
                    control={createChatForm.control}
                    name="message"
                    render={({ field }) => (
                      <div>
                        <IonLabel>Enter Message</IonLabel>
                        <IonTextarea
                          onIonChange={(e) =>
                            createChatForm.setValue(
                              'message',
                              e.detail.value as string
                            )
                          }
                          value={field.value}
                        />
                        <ErrorMessage
                          errors={createChatForm.formState.errors}
                          name="message"
                          render={({ message }) => (
                            <p className="text-red-500">{message}</p>
                          )}
                        />
                      </div>
                    )}
                  />
                </div>
                <Button isLoading={isPending} type="submit">
                  Create Chat
                </Button>
              </form>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContentCustom>
    </IonPage>
  );
};

export default CreateChat;
