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
import { useAddLLMProvider } from '@shinkai_network/shinkai-node-state/v2/mutations/addLLMProvider/useAddLLMProvider';
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
    mutateAsync: addLLMProvider,
    isPending,
    isError,
    error,
  } = useAddLLMProvider({
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
    addLLMProvider({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
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
            'space-y-2 bg-white p-4 md:space-y-4 md:rounded-[1.25rem] md:p-10 dark:bg-slate-800'
          }
        >
          <IonRow>
            <IonCol>
              <h2 className={'mb-3 text-center text-lg md:mb-8'}>
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
                              e.detail.value as string,
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
                              e.detail.value as string,
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
                              e.detail.value as string,
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
                                e.detail.value as string,
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
