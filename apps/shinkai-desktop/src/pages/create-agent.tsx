import { zodResolver } from '@hookform/resolvers/zod';
import { AgentAPIModel } from '@shinkai_network/shinkai-message-ts/models/SchemaTypes';
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
  Switch,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { CREATE_JOB_PATH } from '../routes/name';
import { useAuth } from '../store/auth';
import { SubpageLayout } from './layout/simple-layout';

const addAgentSchema = z
  .object({
    agentName: z.string(),
    externalUrl: z.string().url(),
    apikey: z.string(),
    model: z.nativeEnum(Models),
    modelType: z.string(),
    isCustomModel: z.boolean().default(false).optional(),
    modelCustom: z.string().optional(),
    modelTypeCustom: z.string().optional(),
  })
  .superRefine(
    (
      { isCustomModel, model, modelType, modelCustom, modelTypeCustom, apikey },
      ctx,
    ) => {
      if (isCustomModel) {
        if (!modelCustom) {
          ctx.addIssue({
            path: ['modelCustom'],
            code: z.ZodIssueCode.custom,
            message: 'Model Name is required',
          });
        }
        if (!modelTypeCustom) {
          ctx.addIssue({
            path: ['modelTypeCustom'],
            code: z.ZodIssueCode.custom,
            message: 'Model ID is required',
          });
        }
      } else {
        if (!model) {
          ctx.addIssue({
            path: ['model'],
            code: z.ZodIssueCode.custom,
            message: 'Model is required',
          });
        }
        if (!modelType) {
          ctx.addIssue({
            path: ['modelType'],
            code: z.ZodIssueCode.custom,
            message: 'Model Type is required',
          });
        }
        if (!apikey && model !== Models.Ollama) {
          ctx.addIssue({
            path: ['apiKey'],
            code: z.ZodIssueCode.custom,
            message: 'Api Key is required',
          });
        }
      }
    },
  );

const modelOptions: { value: Models; label: string }[] = [
  {
    value: Models.OpenAI,
    label: 'OpenAI',
  },
  {
    value: Models.TogetherComputer,
    label: 'Together AI',
  },
  {
    value: Models.Ollama,
    label: 'Ollama',
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
      isCustomModel: false,
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

  const { model: currentModel, isCustomModel: isCustomModelMode } =
    addAgentForm.watch();

  const [modelTypeOptions, setModelTypeOptions] = useState<
    { label: string; value: string }[]
  >([]);
  useEffect(() => {
    if (isCustomModelMode) {
      addAgentForm.setValue('externalUrl', '');
      return;
    }
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

  const getModelObject = (
    model: Models | string,
    modelType: string,
  ): AgentAPIModel => {
    switch (model) {
      case Models.OpenAI:
        return { OpenAI: { model_type: modelType } };
      case Models.TogetherComputer:
        return { GenericAPI: { model_type: modelType } };
      case Models.Ollama:
        return { Ollama: { model_type: modelType } };
      default:
        return { [model]: { model_type: modelType } };
    }
  };

  const onSubmit = async (data: z.infer<typeof addAgentSchema>) => {
    if (!auth) return;
    let model = getModelObject(data.model, data.modelType);
    if (isCustomModelMode && data.modelCustom && data.modelTypeCustom) {
      model = getModelObject(data.modelCustom, data.modelTypeCustom);
    }
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
        model,
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
    <SubpageLayout title="Add Agent AI">
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
              name="isCustomModel"
              render={({ field }) => (
                <FormItem className="mt-10 mt-4 flex flex-row items-center space-x-3  py-3">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      id={'custom-model'}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <label htmlFor="custom-model">Add a custom model</label>
                  </div>
                </FormItem>
              )}
            />
            {!isCustomModelMode && (
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
            )}

            {!isCustomModelMode && (
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
            {isCustomModelMode && (
              <>
                <FormField
                  control={addAgentForm.control}
                  name="modelCustom"
                  render={({ field }) => (
                    <TextField field={field} label={'Model Name'} />
                  )}
                />
                <FormField
                  control={addAgentForm.control}
                  name="modelTypeCustom"
                  render={({ field }) => (
                    <TextField field={field} label={'Model ID'} />
                  )}
                />
              </>
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
    </SubpageLayout>
  );
};
export default CreateAgentPage;
