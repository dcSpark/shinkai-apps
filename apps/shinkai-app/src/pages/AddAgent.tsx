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
  IonSelect,
  IonSelectOption,
  IonTitle,
} from '@ionic/react';
import { useCreateAgent } from '@shinkai_network/shinkai-node-state/lib/mutations/createAgent/useCreateAgent';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router';
import z from 'zod';

import Button from '../components/ui/Button';
import { IonContentCustom, IonHeaderCustom } from '../components/ui/Layout';
import { useAuth } from '../store/auth';

const addAgentSchema = z.object({
  agentName: z.string(),
  externalUrl: z.string().url(),
  apikey: z.string(),
  model: z.string(),
  modelType: z.string(),
});

const AddAgent: React.FC = () => {
  const history = useHistory();
  const auth = useAuth((state) => state.auth);
  const addAgentForm = useForm<z.infer<typeof addAgentSchema>>({
    resolver: zodResolver(addAgentSchema),
    defaultValues: {
      modelType: 'gpt-3.5-turbo',
    },
  });

  const {
    mutateAsync: createAgent,
    isPending,
    isError,
    error,
  } = useCreateAgent({
    onSuccess: () => {
      history.push('/create-job');
    },
  });
  const { model, modelType } = addAgentForm.watch();

  const onSubmit = (data: z.infer<typeof addAgentSchema>) => {
    const modelMapping: Record<string, { model_type: string }> = {
      OpenAI: { model_type: modelType },
    };

    if (!auth) return;
    createAgent({
      nodeAddress: auth.node_address,
      sender_subidentity: auth.profile,
      node_name: auth.shinkai_identity,
      agent: {
        allowed_message_senders: [],
        api_key: data.apikey,
        external_url: data.externalUrl,
        full_identity_name: `${auth.shinkai_identity}/${auth.profile}/agent/${data.agentName}`,
        id: data.agentName,
        perform_locally: false,
        storage_bucket_permissions: [],
        toolkit_permissions: [],
        model: {
          [model]: modelMapping[model],
        },
      },
      setupDetailsState: {
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
      },
    });
  };

  return (
    <IonPage>
      <IonHeaderCustom>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/home" />
        </IonButtons>
        <IonTitle>Add Agent</IonTitle>
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
                New Agent Details
              </h2>

              <form
                className="space-y-10"
                onSubmit={addAgentForm.handleSubmit(onSubmit)}
              >
                <div className="space-y-6">
                  <Controller
                    control={addAgentForm.control}
                    name="agentName"
                    render={({ field }) => (
                      <div>
                        <IonLabel>Agent Name</IonLabel>
                        <IonInput
                          placeholder="Eg: Personal AI Agent"
                          {...field}
                          onIonChange={(e) =>
                            addAgentForm.setValue(
                              'agentName',
                              e.detail.value as string
                            )
                          }
                        />
                        <ErrorMessage
                          errors={addAgentForm.formState.errors}
                          name="agentName"
                          render={({ message }) => (
                            <p className="text-red-500">{message}</p>
                          )}
                        />
                      </div>
                    )}
                  />
                  <Controller
                    control={addAgentForm.control}
                    name="externalUrl"
                    render={({ field }) => (
                      <div>
                        <IonLabel>External URL</IonLabel>
                        <IonInput
                          placeholder="Eg: https://api.openai.com"
                          {...field}
                          onIonChange={(e) =>
                            addAgentForm.setValue(
                              'externalUrl',
                              e.detail.value as string
                            )
                          }
                        />
                        <ErrorMessage
                          errors={addAgentForm.formState.errors}
                          name="externalUrl"
                          render={({ message }) => (
                            <p className="text-red-500">{message}</p>
                          )}
                        />
                      </div>
                    )}
                  />

                  <Controller
                    control={addAgentForm.control}
                    name="apikey"
                    render={({ field }) => (
                      <div>
                        <IonLabel>API Key</IonLabel>
                        <IonInput
                          placeholder="Eg: xYz1DFa..."
                          {...field}
                          onIonChange={(e) =>
                            addAgentForm.setValue(
                              'apikey',
                              e.detail.value as string
                            )
                          }
                        />
                        <ErrorMessage
                          errors={addAgentForm.formState.errors}
                          name="apikey"
                          render={({ message }) => (
                            <p className="text-red-500">{message}</p>
                          )}
                        />
                      </div>
                    )}
                  />

                  <Controller
                    control={addAgentForm.control}
                    name="model"
                    render={({ field }) => (
                      <div>
                        <IonLabel>Select your Model</IonLabel>
                        <IonSelect
                          onIonChange={(e) =>
                            addAgentForm.setValue('model', e.detail.value)
                          }
                          placeholder="Select your Model"
                          value={field.value}
                        >
                          <IonSelectOption value="OpenAI">
                            OpenAI
                          </IonSelectOption>
                        </IonSelect>
                        <ErrorMessage
                          errors={addAgentForm.formState.errors}
                          name="model"
                          render={({ message }) => (
                            <p className="text-red-500">{message}</p>
                          )}
                        />
                      </div>
                    )}
                  />

                  {model && (
                    <Controller
                      control={addAgentForm.control}
                      name="modelType"
                      render={({ field }) => (
                        <div>
                          <IonLabel>{model} Model Type</IonLabel>
                          <IonInput
                            placeholder="Eg: gpt-3.5-turbo"
                            {...field}
                            onIonChange={(e) =>
                              addAgentForm.setValue(
                                'modelType',
                                e.detail.value as string
                              )
                            }
                          />
                        </div>
                      )}
                    />
                  )}
                </div>

                {isError && (
                  <div className="rounded bg-red-500/10 px-4 py-2 text-sm text-red-700">
                    <span className="font-bold">Error: </span>
                    <span className="block sm:inline">
                      {error as unknown as string}
                    </span>
                  </div>
                )}

                <Button isLoading={isPending} type="submit">
                  Create Agent
                </Button>
              </form>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContentCustom>
    </IonPage>
  );
};

export default AddAgent;
