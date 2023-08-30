import { zodResolver } from '@hookform/resolvers/zod';
import { AgentAPIModel } from '@shinkai_network/shinkai-message-ts/models';
import {
  addAgentFormDefault,
  AddAgentFormSchema,
  addAgentSchema,
} from '@shinkai_network/shinkai-node-state/forms/agents/add-agent';
import { useCreateAgent } from '@shinkai_network/shinkai-node-state/lib/mutations/createAgent/useCreateAgent';
import { useScanOllamaModels } from '@shinkai_network/shinkai-node-state/lib/queries/scanOllamaModels/useScanOllamaModels';
import {
  Models,
  modelsConfig,
} from '@shinkai_network/shinkai-node-state/lib/utils/models';
import {
  Button,
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
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth/auth';

export const getModelObject = (
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

export const AddAgent = () => {
  const history = useHistory();
  const auth = useAuth((state) => state.auth);
  const form = useForm<AddAgentFormSchema>({
    resolver: zodResolver(addAgentSchema),
    defaultValues: addAgentFormDefault,
  });

  const intl = useIntl();

  const {
    model: currentModel,
    isCustomModel: isCustomModelMode,
    modelType: currentModelType,
  } = form.watch();

  const {
    data: ollamaModels,
    isError: isOllamaModelsError,
    error: ollamaModelsError,
  } = useScanOllamaModels(
    {
      nodeAddress: auth?.node_address ?? '',
      sender: auth?.shinkai_identity ?? '',
      senderSubidentity: auth?.profile ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
      my_device_identity_sk: auth?.my_device_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    },
    {
      enabled: !isCustomModelMode && currentModel === Models.Ollama,
      refetchOnWindowFocus: true,
      retry: 1,
      staleTime: 0,
    },
  );

  useEffect(() => {
    if (isOllamaModelsError) {
      toast.error(
        'Failed to fetch local Ollama models. Please ensure Ollama is running correctly.',
        {
          description: ollamaModelsError?.message,
        },
      );
    }
  }, [isOllamaModelsError, ollamaModelsError?.message]);

  const { mutateAsync: createAgent, isPending } = useCreateAgent({
    onSuccess: () => {
      history.replace(
        { pathname: '/inboxes/create-job' },
        { agentName: form.getValues().agentName },
      );
    },
    onError: (error) => {
      toast.error('Error adding agent', {
        description: error instanceof Error ? error.message : error,
      });
    },
  });
  const modelOptions: { value: Models; label: string }[] = [
    {
      value: Models.OpenAI,
      label: intl.formatMessage({ id: 'openai' }),
    },
    {
      value: Models.TogetherComputer,
      label: intl.formatMessage({ id: 'togethercomputer' }),
    },
    {
      value: Models.Ollama,
      label: intl.formatMessage({ id: 'ollama' }),
    },
  ];
  const submit = async (values: AddAgentFormSchema) => {
    if (!auth) return;
    let model = getModelObject(values.model, values.modelType);
    if (isCustomModelMode && values.modelCustom && values.modelTypeCustom) {
      model = getModelObject(values.modelCustom, values.modelTypeCustom);
    }
    await createAgent({
      nodeAddress: auth?.node_address ?? '',
      sender_subidentity: auth.profile,
      node_name: auth.shinkai_identity,
      agent: {
        allowed_message_senders: [],
        api_key: values.apikey,
        external_url: values.externalUrl,
        full_identity_name: `${auth.shinkai_identity}/${auth.profile}/agent/${values.agentName}`,
        id: values.agentName,
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
  const [modelTypeOptions, setModelTypeOptions] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    if (isCustomModelMode) {
      form.setValue('externalUrl', '');
      return;
    }
    if (currentModel === Models.Ollama) {
      form.setValue('externalUrl', modelsConfig[Models.Ollama].apiUrl);

      setModelTypeOptions(
        (ollamaModels ?? []).map((model) => ({
          label: model.model,
          value: model.model,
        })),
      );
      return;
    }
    const modelConfig = modelsConfig[currentModel as Models];
    form.setValue('externalUrl', modelConfig.apiUrl);
    setModelTypeOptions(
      modelsConfig[currentModel as Models].modelTypes.map((modelType) => ({
        label: modelType.name,
        value: modelType.value,
      })),
    );
  }, [currentModel, form, isCustomModelMode, ollamaModels]);
  useEffect(() => {
    if (!modelTypeOptions?.length) {
      return;
    }
    form.setValue('modelType', modelTypeOptions[0].value);
  }, [modelTypeOptions, form]);
  useEffect(() => {
    if (!modelTypeOptions?.length) {
      return;
    }
    form.setValue('agentName', currentModelType.replace(/[^a-zA-Z0-9_]/g, '_'));
  }, [form, currentModelType, modelTypeOptions?.length]);
  return (
    <div className="flex h-full flex-col space-y-3">
      <Form {...form}>
        <form
          className="flex h-full flex-col justify-between space-y-3"
          onSubmit={form.handleSubmit(submit)}
        >
          <div className="flex grow flex-col space-y-3">
            <FormField
              control={form.control}
              name="isCustomModel"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3  py-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      id={'custom-model'}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div
                    className={cn(
                      'text-gray-80 space-y-1 text-sm leading-none',
                      field.value && 'text-white',
                    )}
                  >
                    <label htmlFor="custom-model">Add a custom model</label>
                  </div>
                </FormItem>
              )}
            />
            {!isCustomModelMode && (
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      defaultValue={field.value as unknown as string}
                      disabled={!!isCustomModelMode}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormLabel>
                        <FormattedMessage id="model.one" />
                      </FormLabel>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Models place" />
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

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {!isCustomModelMode && (
              <FormField
                control={form.control}
                name="modelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <FormattedMessage id="model.other" />
                    </FormLabel>
                    <Select
                      defaultValue={field.value as unknown as string}
                      disabled={!!isCustomModelMode}
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
                  control={form.control}
                  name="modelCustom"
                  render={({ field }) => (
                    <TextField field={field} label={'Model Name'} />
                  )}
                />
                <FormField
                  control={form.control}
                  name="modelTypeCustom"
                  render={({ field }) => (
                    <TextField field={field} label={'Model ID'} />
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="agentName"
              render={({ field }) => (
                <TextField
                  autoFocus
                  data-testid="agent-name-input"
                  field={field}
                  label={<FormattedMessage id="agent-name" />}
                />
              )}
            />

            <FormField
              control={form.control}
              name="externalUrl"
              render={({ field }) => (
                <TextField
                  field={field}
                  label={<FormattedMessage id="external-url" />}
                />
              )}
            />

            <FormField
              control={form.control}
              name="apikey"
              render={({ field }) => (
                <TextField
                  field={field}
                  label={<FormattedMessage id="api-key" />}
                />
              )}
            />
          </div>
          <Button
            className="w-full"
            data-testid="add-agent-submit-button"
            disabled={isPending}
            isLoading={isPending}
            type="submit"
          >
            <FormattedMessage id="add-agent" />
          </Button>
        </form>
      </Form>
    </div>
  );
};
