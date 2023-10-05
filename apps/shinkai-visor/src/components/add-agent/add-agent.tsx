import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateAgent } from "@shinkai_network/shinkai-node-state/lib/mutations/createAgent/useCreateAgent";
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { z } from 'zod';

import { useAuth } from '../../store/auth/auth';
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
  SelectTrigger,
  SelectValue,
} from '../ui/select';

enum Models {
  OpenAI = 'open-api',
  SleepApi = 'sleep-api',
}

const formSchema = z.object({
  agentName: z.string().nonempty(),
  externalUrl: z.string().url().nonempty(),
  apiKey: z.string().nonempty(),
  model: z.nativeEnum(Models),
});

type AddAgentFieldType = z.infer<typeof formSchema>;

export const AddAgent = () => {
  const history = useHistory();
  const auth = useAuth((state) => state.auth);
  const form = useForm<AddAgentFieldType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agentName: 'gpt',
      externalUrl: 'https://api.openai.com',
      apiKey: '',
      model: Models.OpenAI,
    },
  });
  const intl = useIntl();
  const {
    mutateAsync: createAgent,
    isLoading,
    isError,
    error,
  } = useCreateAgent({
    onSuccess: () => {
      history.replace('/agents');
    },
  });

  const modelOptions: { value: Models; label: string }[] = [
    {
      value: Models.OpenAI,
      label: intl.formatMessage({ id: 'openai' }),
    },
    {
      value: Models.SleepApi,
      label: intl.formatMessage({ id: 'sleep-api' }),
    },
  ];
  const submit = (values: AddAgentFieldType) => {
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
        model: values.model === Models.OpenAI
        ? { OpenAI: { model_type: 'gpt-3.5-turbo' } }
        : { SleepAPI: {} },
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
    <div className="h-full p-1">
      <Form {...form}>
        <form
          className="h-full flex flex-col space-y-2 justify-between"
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
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
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
          </div>
          <Button
            className="w-full"
            disabled={!form.formState.isValid || isLoading}
            type="submit"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <FormattedMessage id="connect" />
          </Button>
        </form>
      </Form>
    </div>
  );
};
