import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { z } from 'zod';

import { useQuery } from '../../hooks/use-query';
import { RootState, useTypedDispatch } from '../../store';
import { getAgents } from '../../store/agents/agents-actions';
import { createJob } from '../../store/jobs/jobs-actions';
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

const formSchema = z.object({
  agent: z.string().nonempty(),
  content: z.string().nonempty(),
});

type CreateJobFieldType = z.infer<typeof formSchema>;

export const CreateJob = () => {
  const history = useHistory();
  const query = useQuery();
  const form = useForm<CreateJobFieldType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agent: '',
      content: '',
    },
  });
  const isLoading = useSelector(
    (state: RootState) => state.jobs?.create?.status === 'loading',
  );
  const dispatch = useTypedDispatch();
  const agents = useSelector((state: RootState) => state.agents?.agents?.data);
  const submit = (values: CreateJobFieldType) => {
    let content = values.content;
    if (query.has('context')) {
      content = `${values.content} - ${query.get('context')}`;
    }
    dispatch(
      createJob({
        agentId: values.agent,
        content,
      }),
    )
      .unwrap()
      .then((value) => {
        const jobId = encodeURIComponent(`job_inbox::${value.job.id}::false`);
        history.replace(`/inboxes/${jobId}`);
      })
      .catch(() => {
        console.log('error creating job');
      });
  };
  useEffect(() => {
    dispatch(getAgents());
  }, [dispatch]);

  return (
    <Form {...form}>
      <form
        className="p-1 h-full flex flex-col space-y-2 justify-between"
        onSubmit={form.handleSubmit(submit)}
      >
        <div className="grow flex flex-col space-y-2">
          <FormField
            control={form.control}
            name="agent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <FormattedMessage id="agent.one" />
                </FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {agents?.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {(model.full_identity_name as any)?.subidentity_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {query.has('context') && (
            <blockquote className="max-h-28 p-4 mb-5 border-l-4 border-gray-300 bg-gray-50 dark:border-gray-500 dark:bg-gray-800">
              <p className="italic dark:text-white text-ellipsis overflow-hidden h-full">
                {query.get('context')}
              </p>
            </blockquote>
          )}

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <FormattedMessage id="message.one" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
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
  );
};
