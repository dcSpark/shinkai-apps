import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateAgent } from '@shinkai_network/shinkai-node-state/lib/mutations/createAgent/useCreateAgent';
import { Bot, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { z } from 'zod';

import { useAuth } from '../../store/auth/auth';
import { Header } from '../header/header';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Models, modelsConfig } from './models';

const formSchema = z.object({
  // TODO: Translate this error message
  agentName: z.string().regex(/^[a-zA-Z0-9]+(_[a-zA-Z0-9]+)*$/, 'It just accepts alphanumeric characters and underscores'),
  externalUrl: z.string().url(),
  apiKey: z.string().min(4),
  model: z.nativeEnum(Models),
  modelType: z.string().min(4),
});

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
    },
  });
  const intl = useIntl();
  const currentModel = useWatch<FormSchemaType>({
    control: form.control,
    name: 'model',
  });
  const { mutateAsync: createAgent, isLoading } = useCreateAgent({
    onSuccess: () => {
      history.replace({ pathname: '/inboxes/create-job' }, { agentName: form.getValues().agentName });
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
  ];
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
  const submit = (values: FormSchemaType) => {
    if (!auth) return;
    createAgent({
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
    const modelConfig = modelsConfig[currentModel as Models];
    form.setValue('externalUrl', modelConfig.apiUrl);
    setModelTypeOptions(
      modelsConfig[currentModel as Models].modelTypes.map((modelType) => ({
        label: modelType.name,
        value: modelType.value,
      }))
    );
  }, [currentModel, form]);
  useEffect(() => {
    if (!modelTypeOptions?.length) {
      return;
    }
    form.setValue('modelType', modelTypeOptions[0].value);
  }, [modelTypeOptions, form]);

  return (
    <div className="h-full flex flex-col space-y-3">
      <Header
        icon={<Bot />}
        title={<FormattedMessage id="add-agent"></FormattedMessage>}
      />
      <Form {...form}>
        <form
          className="h-full flex flex-col space-y-3 justify-between"
          onSubmit={form.handleSubmit(submit)}
        >
          <div className="grow flex flex-col space-y-2">
            <FormField
              control={form.control}
              name="agentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage id="agent-name" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="externalUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage id="external-url" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage id="api-key" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage id="model.one" />
                  </FormLabel>
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
                    <SelectPortal>
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
                    </SelectPortal>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="modelType"
              render={({ field }) => (
                <FormItem>
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
                    <SelectPortal>
                      <SelectContent className="max-h-[150px] max-w-[325px] text-xs overflow-y-auto">
                        {modelTypeOptions.map((modelType) => (
                          <SelectItem
                            key={modelType.value}
                            value={modelType.value}
                          >
                            {modelType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bot className="mr-2 h-4 w-4"></Bot>
            )}
            <FormattedMessage id="add-agent" />
          </Button>
        </form>
      </Form>
    </div>
  );
};
