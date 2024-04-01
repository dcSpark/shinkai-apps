import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateAgent } from '@shinkai_network/shinkai-node-state/lib/mutations/createAgent/useCreateAgent';
import {
  Models,
  modelsConfig,
} from '@shinkai_network/shinkai-node-state/lib/utils/models';
import {
  Button,
  ErrorMessage,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { CREATE_JOB_PATH } from '../routes/name';
import { useAuth } from '../store/auth';
import SimpleLayout from './layout/simple-layout';

const addAgentSchema = z.object({
  agentName: z.string(),
  externalUrl: z.string().url(),
  apikey: z.string(),
  model: z.nativeEnum(Models),
  modelType: z.string(),
});

const modelOptions: { value: Models; label: string }[] = [
  {
    value: Models.OpenAI,
    label: 'OpenAI',
  },
  {
    value: Models.TogetherComputer,
    label: 'Together AI',
  },
];

const CreateAgentPage = () => {
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const addAgentForm = useForm<z.infer<typeof addAgentSchema>>({
    resolver: zodResolver(addAgentSchema),
    defaultValues: {
      modelType: '',
      externalUrl: modelsConfig[Models.OpenAI].apiUrl,
      apikey: '',
      model: Models.OpenAI,
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

  const { model: currentModel } = addAgentForm.watch();

  const [modelTypeOptions, setModelTypeOptions] = useState<
    { label: string; value: string }[]
  >([]);
  useEffect(() => {
    const modelConfig = modelsConfig[currentModel as Models];
    addAgentForm.setValue('externalUrl', modelConfig.apiUrl);
    setModelTypeOptions(
      modelsConfig[currentModel as Models].modelTypes.map((modelType) => ({
        label: modelType.name,
        value: modelType.value,
      })),
    );
  }, [currentModel, addAgentForm]);
  useEffect(() => {
    if (!modelTypeOptions?.length) {
      return;
    }
    addAgentForm.setValue('modelType', modelTypeOptions[0].value);
  }, [modelTypeOptions, addAgentForm]);

  const getModelObject = (model: Models, modelType: string) => {
    switch (model) {
      case Models.OpenAI:
        return { OpenAI: { model_type: modelType } };
      case Models.TogetherComputer:
        return { GenericAPI: { model_type: modelType } };
      default:
        throw new Error('unknown model');
    }
  };

  const onSubmit = async (data: z.infer<typeof addAgentSchema>) => {
    if (!auth) return;
    await createAgent({
      nodeAddress: auth?.node_address ?? '',
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
        model: getModelObject(data.model, data.modelType),
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
                      {modelOptions.map((model) => (
                        <SelectItem
                          key={model.value}
                          value={model.value.toString()}
                        >
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {currentModel && (
              <FormField
                control={addAgentForm.control}
                name="modelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model Type</FormLabel>
                    <Select
                      defaultValue={field.value as unknown as string}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[150px] overflow-y-auto text-xs">
                        {modelTypeOptions.map((modelType) => (
                          <SelectItem
                            key={modelType.value}
                            value={modelType.value}
                          >
                            {modelType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
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
