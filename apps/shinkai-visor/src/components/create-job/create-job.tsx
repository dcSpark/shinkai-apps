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
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@shinkai_network/shinkai-ui';
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

const formSchema = z.object({
  agent: z.string().min(1),
  content: z.string().min(1),
  files: z.array(z.any()).max(3),
});

type FormSchemaType = z.infer<typeof formSchema>;

export const CreateJob = () => {
  const history = useHistory();
  const intl = useIntl();
  const location = useLocation<{ files: File[]; agentName: string }>();
  const query = useQuery();
  const auth = useAuth((state) => state.auth);
  // const settings = useSettings((state) => state.settings);
  const currentDefaultAgentId = useSettings((state) => state.defaultAgentId);
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agent: '',
      content: query.get('initialText') ?? '',
      files: [],
    },
  });
  const { agents } = useAgents({
    nodeAddress: auth?.node_address ?? '',
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
    '.jobkai',
  ];
  useEffect(() => {
    form.setValue('files', location?.state?.files || []);
  }, [location, form]);
  useEffect(() => {
    if (!location?.state?.agentName) {
      return;
    }
    const agent = agents.find((agent) => agent.id === location.state.agentName);
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
      (currentDefaultAgentId &&
      agents.find((agent) => agent.id === currentDefaultAgentId)
        ? currentDefaultAgentId
        : '');
    defaultAgentId = defaultAgentId || (agents?.length ? agents[0].id : '');
    form.setValue('agent', defaultAgentId);
  }, [form, location, agents, currentDefaultAgentId]);
  const submit = (values: FormSchemaType) => {
    if (!auth) return;
    let content = values.content;
    if (query.has('context')) {
      content = `${values.content} - \`\`\`${query.get('context')}\`\`\``;
    }
    createJob({
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth.shinkai_identity,
      profile: auth.profile,
      agentId: values.agent,
      content: content,
      files_inbox: '',
      files: values.files,
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
          <ScrollArea className="pr-4 [&>div>div]:!block">
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
                          {agent.id}
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
            {query.has('context') && (
              <div className="my-4">
                <blockquote className="border-l-4 border-gray-200 bg-gray-300 py-2.5 pl-3 pr-3">
                  <span className="text-gray-80 font-medium">
                    Your selected text
                  </span>
                  <p className="line-clamp-2 h-full text-white">
                    {query.get('context')}
                  </p>
                </blockquote>
              </div>
            )}

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="mt-3">
                  <FormLabel>
                    <FormattedMessage id="message.one" />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      autoFocus
                      className="resize-none"
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' &&
                          (event.metaKey || event.ctrlKey)
                        ) {
                          form.handleSubmit(submit)();
                        }
                      }}
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
          </ScrollArea>

          <Button
            className="w-full"
            data-testid="create-job-submit-button"
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
