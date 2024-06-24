import { ErrorMessage } from '@hookform/error-message';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IonBackButton,
  IonButtons,
  IonCol,
  IonGrid,
  IonLabel,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
} from '@ionic/react';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/lib/mutations/createJob/useCreateJob';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/lib/queries/getLLMProviders/useGetLLMProviders';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router';
import z from 'zod';

import Button from '../components/ui/Button';
import { IonContentCustom, IonHeaderCustom } from '../components/ui/Layout';
import { useAuth } from '../store/auth';

const createJobSchema = z.object({
  model: z.string(),
  description: z.string(),
});

const CreateJob: React.FC = () => {
  const auth = useAuth((state) => state.auth);
  const { llmProviders } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: `${auth?.profile}`,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const history = useHistory();

  const { isPending, mutateAsync: createJob } = useCreateJob({
    onSuccess: (data) => {
      const jobId = encodeURIComponent(buildInboxIdFromJobId(data.jobId));
      history.push(`/job-chat/${jobId}`);
    },
  });

  const createJobForm = useForm<z.infer<typeof createJobSchema>>({
    resolver: zodResolver(createJobSchema),
  });

  const onSubmit = async (data: z.infer<typeof createJobSchema>) => {
    if (!auth) return;
    createJob({
      nodeAddress: auth.node_address,
      shinkaiIdentity: auth.shinkai_identity,
      profile: auth.profile,
      agentId: data.model,
      content: data.description,
      files_inbox: '',
      files: [],
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
        <IonTitle>Create Job</IonTitle>
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
                New Job Details
              </h2>

              <form
                className="space-y-10"
                onSubmit={createJobForm.handleSubmit(onSubmit)}
              >
                <div className="space-y-6">
                  <Controller
                    control={createJobForm.control}
                    name="model"
                    render={({ field }) => (
                      <div>
                        <IonLabel>Select Agent</IonLabel>
                        <IonSelect
                          onIonChange={(e) =>
                            createJobForm.setValue('model', e.detail.value)
                          }
                          placeholder="Select One"
                          value={field.value}
                        >
                          {llmProviders.map((agent, index) => (
                            <IonSelectOption key={index} value={agent.id}>
                              {agent.id}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                        <ErrorMessage
                          errors={createJobForm.formState.errors}
                          name="model"
                          render={({ message }) => (
                            <p className="text-red-500">{message}</p>
                          )}
                        />
                      </div>
                    )}
                  />

                  <Controller
                    control={createJobForm.control}
                    name="description"
                    render={({ field }) => (
                      <div>
                        <IonLabel>Tell me the job to do</IonLabel>
                        <IonTextarea
                          onIonChange={(e) =>
                            createJobForm.setValue(
                              'description',
                              e.detail.value as string,
                            )
                          }
                          value={field.value}
                        />
                        <ErrorMessage
                          errors={createJobForm.formState.errors}
                          name="description"
                          render={({ message }) => (
                            <p className="text-red-500">{message}</p>
                          )}
                        />
                      </div>
                    )}
                  />
                </div>

                <Button isLoading={isPending} type="submit">
                  Create Job
                </Button>
              </form>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContentCustom>
    </IonPage>
  );
};

export default CreateJob;
