import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { z } from 'zod';

import { RootState, useTypedDispatch } from '../../store';
import { addAgent } from '../../store/agents/agents-actions';
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
  const isLoading = useSelector(
    (state: RootState) => state.agents?.add?.status === 'loading',
  );
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
  const dispatch = useTypedDispatch();
  const submit = (values: AddAgentFieldType) => {
    dispatch(
      addAgent({
        agent: {
          agentName: values.agentName,
          externalUrl: values.externalUrl,
          apiKey: values.apiKey,
          model:
            values.model === Models.OpenAI
              ? { OpenAI: { model_type: 'gpt-3.5-turbo' } }
              : { SleepAPI: {} },
        },
      }),
    )
      .unwrap()
      .then(() => {
        history.replace('/agents');
      })
      .catch(() => {
        console.log('error adding agent');
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
