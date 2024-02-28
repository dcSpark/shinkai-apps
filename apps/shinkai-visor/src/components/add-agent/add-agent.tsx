import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateAgent } from '@shinkai_network/shinkai-node-state/lib/mutations/createAgent/useCreateAgent';
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
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { z } from 'zod';

import { useAuth } from '../../store/auth/auth';
import { Header } from '../header/header';
import { Models, modelsConfig } from './models';

const formSchema = z
  .object({
    // TODO: Translate this error message
    agentName: z
      .string()
      .regex(
        /^[a-zA-Z0-9]+(_[a-zA-Z0-9]+)*$/,
        'It just accepts alphanumeric characters and underscores',
      ),
    externalUrl: z.string().url(),
    apiKey: z.string(),
    model: z.nativeEnum(Models),
    modelType: z.string(),
    isCustomModel: z.boolean().default(false).optional(),
    modelCustom: z.string().optional(),
    modelTypeCustom: z.string().optional(),
  })
  .superRefine(
    (
      { isCustomModel, model, modelType, modelCustom, modelTypeCustom, apiKey },
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
        if (!apiKey && model !== Models.Ollama) {
          ctx.addIssue({
            path: ['apiKey'],
            code: z.ZodIssueCode.custom,
            message: 'Api Key is required',
          });
        }
      }
    },
  );

type FormSchemaType = z.infer<typeof formSchema>;

export const AddAgent = () => {
  const history = useHistory();
  const auth = useAuth((state) => state.auth);
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agentName: '',
      externalUrl: modelsConfig[Models.OpenAI].apiUrl,
      apiKey: '',
      model: Models.OpenAI,
      modelType: '',
      isCustomModel: false,
    },
  });

  const intl = useIntl();
  const currentModel = useWatch<FormSchemaType>({
    control: form.control,
    name: 'model',
  });
  const isCustomModelMode = useWatch<FormSchemaType>({
    control: form.control,
    name: 'isCustomModel',
  });

  const { mutateAsync: createAgent, isPending } = useCreateAgent({
    onSuccess: () => {
      history.replace(
        { pathname: '/inboxes/create-job' },
        { agentName: form.getValues().agentName },
      );
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
  const getModelObject = (model: Models, modelType: string) => {
    if (isCustomModelMode) {
      return { GenericAPI: { model_type: modelType } };
    }

    switch (model) {
      case Models.OpenAI:
        return { OpenAI: { model_type: modelType } };
      case Models.TogetherComputer:
        return { GenericAPI: { model_type: modelType } };
      case Models.Ollama:
        return { Ollama: { model_type: modelType } };
      default:
        throw new Error('unknown model');
    }
  };
  const submit = (values: FormSchemaType) => {
    if (!auth) return;
    createAgent({
      nodeAddress: auth?.node_address ?? '',
      sender_subidentity: auth.profile,
      node_name: auth.shinkai_identity,
      agent: {
        allowed_message_senders: [],
        api_key: values.apiKey,
        external_url: values.externalUrl,
        full_identity_name: `${auth.shinkai_identity}/${auth.profile}/agent/${values.agentName}`,
        id: values.agentName,
        perform_locally: false,
        storage_bucket_permissions: [],
        toolkit_permissions: [],
        model: getModelObject(values.model, values.modelType),
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
    const modelConfig = modelsConfig[currentModel as Models];
    form.setValue('externalUrl', modelConfig.apiUrl);
    setModelTypeOptions(
      modelsConfig[currentModel as Models].modelTypes.map((modelType) => ({
        label: modelType.name,
        value: modelType.value,
      })),
    );
  }, [currentModel, form]);
  useEffect(() => {
    if (!modelTypeOptions?.length) {
      return;
    }
    form.setValue('modelType', modelTypeOptions[0].value);
  }, [modelTypeOptions, form]);

  return (
    <div className="flex h-full flex-col space-y-3">
      <Header title={<FormattedMessage id="add-agent" />} />
      <Form {...form}>
        <form
          className="flex h-full flex-col justify-between space-y-3"
          onSubmit={form.handleSubmit(submit)}
        >
          <div className="flex grow flex-col space-y-2">
            <FormField
              control={form.control}
              name="agentName"
              render={({ field }) => (
                <TextField
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
              name="apiKey"
              render={({ field }) => (
                <TextField
                  field={field}
                  label={<FormattedMessage id="api-key" />}
                />
              )}
            />

            <FormField
              control={form.control}
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
