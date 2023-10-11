import { zodResolver } from '@hookform/resolvers/zod';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/lib/mutations/createJob/useCreateJob';
import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
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
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const formSchema = z.object({
  agent: z.string().nonempty(),
  content: z.string().nonempty(),
});

type FormSchemaType = z.infer<typeof formSchema>;

export const CreateJob = () => {
  const history = useHistory();
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
      const jobId = encodeURIComponent(buildInboxIdFromJobId(data.jobId));
      history.replace(`/inboxes/${jobId}`);
    },
  });
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
                  <SelectPortal container={uiContainer?.rootElement}>
                    <SelectContent>
                      {agents?.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {(model.full_identity_name as any)?.subidentity_name}
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
            <blockquote className="max-h-28 p-4 mb-5 border-l-4 border-gray-300 bg-gray-50 dark:border-gray-500 dark:bg-gray-800">
              <p className="italic dark:text-white text-ellipsis overflow-hidden h-full">
                {query.get('context')}
              </p>
            </blockquote>
          )}

          {location.state?.files?.length && (
            <blockquote className="max-h-28 p-4 mb-5 border-l-4 border-gray-300 bg-gray-50 dark:border-gray-500 dark:bg-gray-800">
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
