import { zodResolver } from '@hookform/resolvers/zod';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/lib/mutations/createJob/useCreateJob';
import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
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
  Textarea,
} from '@shinkai_network/shinkai-ui';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory, useLocation } from 'react-router-dom';
import { z } from 'zod';

import { useQuery } from '../../hooks/use-query';
import { useAuth } from '../../store/auth/auth';
import { useSettings } from '../../store/settings/settings';
import { FileInput } from '../file-input/file-input';
import { Header } from '../header/header';
import { ScrollArea } from '../ui/scroll-area';

const formSchema = z.object({
  agent: z.string().nonempty(),
  content: z.string().nonempty(),
  files: z.array(z.any()).max(3),
});

type FormSchemaType = z.infer<typeof formSchema>;

export const CreateJob = () => {
  const history = useHistory();
  const intl = useIntl();
  const location = useLocation<{ files: File[]; agentName: string }>();
  const query = useQuery();
  const auth = useAuth((state) => state.auth);
  const settings = useSettings((state) => state.settings);
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agent: '',
      content: '',
      files: [],
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
  const { isPending, mutateAsync: createJob } = useCreateJob({
    onSuccess: (data) => {
      const jobId = encodeURIComponent(buildInboxIdFromJobId(data.jobId));
      history.replace(`/inboxes/${jobId}`);
    },
  });
  const extensions = [
    '.eml',
    '.html',
    '.json',
    '.md',
    '.msg',
    '.rst',
    '.rtf',
    '.txt',
    '.xml',
    '.jpeg',
    '.png',
    '.csv',
    '.doc',
    '.docx',
    '.epub',
    '.odt',
    '.pdf',
    '.ppt',
    '.pptx',
    '.tsv',
    '.xlsx',
  ];
  useEffect(() => {
    form.setValue('files', location?.state?.files || []);
  }, [location, form]);
  useEffect(() => {
    if (!location?.state?.agentName) {
      return;
    }
    const agent = agents.find(
      (agent) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (agent.full_identity_name as any)?.subidentity_name ===
        location.state.agentName,
    );
    if (agent) {
      form.setValue('agent', agent.id);
    }
  }, [form, location, agents]);
  useEffect(() => {
    if (form.getValues().agent) {
      return;
    }
    let defaultAgentId = '';
    defaultAgentId =
      defaultAgentId ||
      (settings?.defaultAgentId &&
      agents.find((agent) => agent.id === settings.defaultAgentId)
        ? settings.defaultAgentId
        : '');
    defaultAgentId = defaultAgentId || (agents?.length ? agents[0].id : '');
    form.setValue('agent', defaultAgentId);
  }, [form, location, agents, settings]);
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
      file: values.files[0],
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
    });
  };
  return (
    <div className="flex h-full flex-col space-y-3">
      <Header title={<FormattedMessage id="create-job" />} />
      <Form {...form}>
        <form
          className="flex grow flex-col justify-between space-y-2 overflow-hidden"
          onSubmit={form.handleSubmit(submit)}
        >
          <ScrollArea className="[&>div>div]:!block">
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
                    <SelectContent>
                      {agents?.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (agent.full_identity_name as any)?.subidentity_name
                          }
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <FormItem className="mt-3">
                  <FormLabel className="sr-only">
                    <FormattedMessage id="file.one" />
                  </FormLabel>
                  <FormControl>
                    <FileInput
                      extensions={extensions}
                      multiple
                      onValueChange={field.onChange}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="mt-3">
                  <FormLabel>
                    <FormattedMessage id="message.one" />
                  </FormLabel>
                  <FormControl>
                    <div className="flex flex-col space-y-1">
                      {query.has('context') && (
                        <blockquote className="bg-secondary-600 mb-5 max-h-28 overflow-hidden border-l-4 border-gray-300 p-4 dark:border-gray-500 dark:bg-gray-800">
                          <p className="h-full truncate italic dark:text-white">
                            {query.get('context')}
                          </p>
                        </blockquote>
                      )}
                      <Textarea
                        autoFocus
                        className="resize-none"
                        placeholder={intl.formatMessage({
                          id: 'tmwtd',
                        })}
                        {...field}
                      />
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </ScrollArea>

          <Button
            className="w-full"
            disabled={isPending}
            isLoading={isPending}
            type="submit"
          >
            <FormattedMessage id="create-job" />
          </Button>
        </form>
      </Form>
    </div>
  );
};
