import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateAgent } from '@shinkai_network/shinkai-node-state/lib/mutations/createAgent/useCreateAgent';
import {
  Button,
  ErrorMessage,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { CREATE_JOB_PATH } from '../routes/name';
import { useAuth } from '../store/auth';
import SimpleLayout from './layout/simple-layout';

const addAgentSchema = z.object({
  agentName: z.string(),
  externalUrl: z.string().url(),
  performLocally: z.boolean(),
  apikey: z.string(),
  model: z.string(),
  modelType: z.string(),
});

const CreateAgentPage = () => {
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const addAgentForm = useForm<z.infer<typeof addAgentSchema>>({
    resolver: zodResolver(addAgentSchema),
    defaultValues: {
      performLocally: false,
      modelType: 'gpt-3.5-turbo-1106',
    },
  });
  const {
    mutateAsync: createAgent,
    isPending,
    isError,
    error,
  } = useCreateAgent({
    onSuccess: () => {
      navigate(CREATE_JOB_PATH);
    },
  });

  const { model, modelType } = addAgentForm.watch();

  const onSubmit = async (data: z.infer<typeof addAgentSchema>) => {
    const modelMapping: Record<string, { model_type: string }> = {
      OpenAI: { model_type: modelType },
    };

    if (!auth) return;
    createAgent({
      sender_subidentity: auth.profile,
      node_name: auth.shinkai_identity,
      agent: {
        allowed_message_senders: [],
        api_key: data.apikey,
        external_url: data.externalUrl,
        full_identity_name: `${auth.shinkai_identity}/${auth.profile}/agent/${data.agentName}`,
        id: data.agentName,
        perform_locally: data.performLocally,
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
    <SimpleLayout title="Add Agent AI">
      <Form {...addAgentForm}>
        <form
          className="space-y-10"
          onSubmit={addAgentForm.handleSubmit(onSubmit)}
        >
          <div className="space-y-6">
            <FormField
              control={addAgentForm.control}
              name="agentName"
              render={({ field }) => (
                <TextField field={field} label="Agent Name" />
              )}
            />
            <FormField
              control={addAgentForm.control}
              name="externalUrl"
              render={({ field }) => (
                <TextField field={field} label="External URL" />
              )}
            />
            <FormField
              control={addAgentForm.control}
              name="apikey"
              render={({ field }) => (
                <TextField field={field} label="Api Key" />
              )}
            />

            <FormField
              control={addAgentForm.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select your Model</FormLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={' '} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="OpenAI">OpenAI</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {model && (
              <FormField
                control={addAgentForm.control}
                name="modelType"
                render={({ field }) => (
                  <TextField field={field} label={`${model} Model Type`} />
                )}
              />
            )}
          </div>

          {isError && <ErrorMessage message={error.message} />}

          <Button
            className="w-full"
            disabled={isPending}
            isLoading={isPending}
            type="submit"
          >
            Create Agent
          </Button>
        </form>
      </Form>
    </SimpleLayout>
  );
};
export default CreateAgentPage;
