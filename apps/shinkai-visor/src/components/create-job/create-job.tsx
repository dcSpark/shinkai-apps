import { zodResolver } from '@hookform/resolvers/zod';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/lib/mutations/createJob/useCreateJob';
import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import { Loader2, Workflow } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory, useLocation } from 'react-router-dom';
import { z } from 'zod';

import { useQuery } from '../../hooks/use-query';
import { useAuth } from '../../store/auth/auth';
import { useUIContainer } from '../../store/ui-container/ui-container';
import { FileList } from '../file-list/file-list';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  agent: z.string().nonempty(),
  content: z.string().nonempty(),
});

type FormSchemaType = z.infer<typeof formSchema>;

export const CreateJob = () => {
  const history = useHistory();
  const intl = useIntl();
  const location = useLocation<{ files: File[] }>();
  const query = useQuery();
  const auth = useAuth((state) => state.auth);
  const uiContainer = useUIContainer((state) => state.uiContainer);
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agent: '',
      content: '',
    },
  });
  const { agents } = useAgents({
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: `${auth?.profile}`,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });
  const { isLoading, mutateAsync: createJob } = useCreateJob({
    onSuccess: (data) => {
      console.log('job created');
      const jobId = encodeURIComponent(buildInboxIdFromJobId(data.jobId));
      history.replace(`/inboxes/${jobId}`);
    },
  });

  //TODO: Replace this assigment with a configured default agent
  useEffect(() => {
    if (agents?.length) {
      const defaultAgentId = agents[0].id;
      form.setValue('agent', defaultAgentId);
    }
  }, [agents, form]);
  const submit = (values: FormSchemaType) => {
    if (!auth) return;
    let content = values.content;
    if (query.has('context')) {
      content = `${values.content} - \`\`\`${query.get('context')}\`\`\``;
    }
    createJob({
      shinkaiIdentity: auth.shinkai_identity,
      profile: auth.profile,
      agentId: values.agent,
      content: content,
      files_inbox: '',
      files: location.state?.files,
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
    });
  };

  return (
    <div className="h-full flex flex-col">
      <h1 className="font-semibold mb-2">
        <FormattedMessage id="create-job"></FormattedMessage>
      </h1>
      <Form {...form}>
        <form
          className="p-1 h-full flex flex-col space-y-2 justify-between"
          onSubmit={form.handleSubmit(submit)}
        >
          <div className="grow flex flex-col space-y-3">
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
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectPortal container={uiContainer?.rootElement}>
                      <SelectContent>
                        {agents?.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {
                              agent.full_identity_name.subidentity_name
                            }
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {query.has('context') && (
              <blockquote className="max-h-28 p-4 mb-5 border-l-4 border-gray-300 bg-secondary-600 dark:border-gray-500 dark:bg-gray-800">
                <p className="italic dark:text-white text-ellipsis overflow-hidden h-full">
                  {query.get('context')}
                </p>
              </blockquote>
            )}

            {location.state?.files?.length && (
              <blockquote className="max-h-28 p-4 mb-5 border-l-4 border-gray-300 bg-secondary-600 dark:border-gray-500 dark:bg-gray-800">
                <FileList files={location.state?.files}></FileList>
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
                    <Textarea
                      autoFocus
                      className="resize-none border-white"
                      placeholder={intl.formatMessage({
                        id: 'tmwtd',
                      })}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Workflow className="mr-2 h-4 w-4"></Workflow>
            )}
            <FormattedMessage id="create-job" />
          </Button>
        </form>
      </Form>
    </div>
  );
};
