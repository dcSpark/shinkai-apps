import { zodResolver } from '@hookform/resolvers/zod';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils';
import {
  CreateJobFormSchema,
  createJobFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/create-job';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/lib/mutations/createJob/useCreateJob';
import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import {
  VRFolder,
  VRItem,
} from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
import { useGetVRPathSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/useGetVRPathSimplified';
import { transformDataToTreeNodes } from '@shinkai_network/shinkai-node-state/lib/utils/files';
import {
  Badge,
  Button,
  FileUploader,
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
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  AISearchContentIcon,
  FilesIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { TreeCheckboxSelectionKeys } from 'primereact/tree';
import { TreeNode } from 'primereact/treenode';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory, useLocation } from 'react-router-dom';

import { useQuery } from '../../hooks/use-query';
import { useAuth } from '../../store/auth/auth';
import { useSettings } from '../../store/settings/settings';
import { allowedFileExtensions } from './constants';
import { KnowledgeSearchDrawer, VectorFsScopeDrawer } from './vector-fs-scope';

export const CreateJob = () => {
  const history = useHistory();
  const intl = useIntl();
  const location = useLocation<{
    files: File[];
    agentName: string;
    selectedVRFiles: VRItem[];
    selectedVRFolders: VRFolder[];
  }>();
  const query = useQuery();
  const auth = useAuth((state) => state.auth);

  const selectedFileKeysRef = useRef<Map<string, VRItem>>(new Map());
  const selectedFolderKeysRef = useRef<Map<string, VRFolder>>(new Map());
  // const settings = useSettings((state) => state.settings);
  const currentDefaultAgentId = useSettings((state) => state.defaultAgentId);
  const {
    // isPending: isVRFilesPending,
    data: VRFiles,
    isSuccess: isVRFilesSuccess,
  } = useGetVRPathSimplified({
    nodeAddress: auth?.node_address ?? '',
    profile: auth?.profile ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    path: '/',
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const form = useForm<CreateJobFormSchema>({
    resolver: zodResolver(createJobFormSchema),
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
  const [isVectorFSOpen, setIsVectorFSOpen] = React.useState(false);
  const [isKnowledgeSearchOpen, setIsKnowledgeSearchOpen] =
    React.useState(false);

  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [selectedKeys, setSelectedKeys] =
    useState<TreeCheckboxSelectionKeys | null>(null);

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

  useEffect(() => {
    if (query.get('initialText')) {
      form.handleSubmit(submit)();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const submit = async (values: CreateJobFormSchema) => {
    if (!auth) return;
    let content = values.content;
    if (query.has('context')) {
      content = `${values.content} - \`\`\`${query.get('context')}\`\`\``;
    }
    const selectedVRFiles =
      selectedFileKeysRef.current.size > 0
        ? Array.from(selectedFileKeysRef.current.values())
        : [];
    const selectedVRFolders =
      selectedFolderKeysRef.current.size > 0
        ? Array.from(selectedFolderKeysRef.current.values())
        : [];

    await createJob({
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth.shinkai_identity,
      profile: auth.profile,
      agentId: values.agent,
      content: content,
      files_inbox: '',
      files: values.files,
      is_hidden: false,
      selectedVRFiles,
      selectedVRFolders,
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
    });
  };

  useEffect(() => {
    if (isVRFilesSuccess) {
      setNodes(transformDataToTreeNodes(VRFiles));
    }
  }, [VRFiles, isVRFilesSuccess]);

  useEffect(() => {
    if (
      location?.state?.selectedVRFiles?.length > 0 ||
      location?.state?.selectedVRFolders?.length > 0
    ) {
      const selectedVRFilesPathMap = location?.state?.selectedVRFiles?.reduce(
        (acc, file) => {
          selectedFileKeysRef.current.set(file.path, file);
          acc[file.path] = {
            checked: true,
          };
          return acc;
        },
        {} as Record<string, { checked: boolean }>,
      );

      const selectedVRFoldersPathMap =
        location?.state?.selectedVRFolders?.reduce(
          (acc, folder) => {
            selectedFolderKeysRef.current.set(folder.path, folder);
            acc[folder.path] = {
              checked: true,
            };
            return acc;
          },
          {} as Record<string, { checked: boolean }>,
        );

      setSelectedKeys({
        ...selectedVRFilesPathMap,
        ...selectedVRFoldersPathMap,
      });
    }
  }, [location?.state?.selectedVRFiles, location?.state?.selectedVRFolders]);

  return (
    <div className="flex h-full flex-col space-y-3">
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
            <div className="my-3 rounded-md bg-gray-400 px-3 py-4">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-sm font-medium text-gray-100">
                    Set Chat Context
                  </h2>
                  <p className="text-gray-80 text-xs">
                    Add files or folders for your AI to use as context during
                    your conversation.
                  </p>
                </div>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="flex h-10 w-10 items-center justify-center gap-2 rounded-lg p-2.5 text-left hover:bg-gray-500"
                        onClick={() => setIsKnowledgeSearchOpen(true)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <AISearchContentIcon className="h-5 w-5" />
                        <p className="sr-only text-xs text-white">
                          AI Files Content Search
                        </p>
                      </Button>
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent sideOffset={0}>
                        Search AI Files Content
                      </TooltipContent>
                    </TooltipPortal>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex flex-col gap-1.5">
                <Button
                  className="hover:bg-gray-350 flex h-[40px] items-center justify-between gap-2 rounded-lg p-2.5 text-left"
                  onClick={() => setIsVectorFSOpen(true)}
                  size="auto"
                  type="button"
                  variant="outline"
                >
                  <div className="flex items-center gap-2">
                    <FilesIcon className="h-4 w-4" />
                    <p className="text-sm text-white">Local AI Files</p>
                  </div>
                  {Object.keys(selectedKeys ?? {}).length > 0 && (
                    <Badge className="bg-brand text-white">
                      {Object.keys(selectedKeys ?? {}).length}
                    </Badge>
                  )}
                </Button>
                <FormField
                  control={form.control}
                  name="files"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">
                        <FormattedMessage id="file.one" />
                      </FormLabel>
                      <FormControl>
                        <FileUploader
                          accept={allowedFileExtensions.join(',')}
                          allowMultiple
                          descriptionText={allowedFileExtensions?.join(' | ')}
                          onChange={(acceptedFiles) => {
                            field.onChange(acceptedFiles);
                          }}
                          shouldDisableScrolling
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
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
      <VectorFsScopeDrawer
        isVectorFSOpen={isVectorFSOpen}
        nodes={nodes}
        onSelectedKeysChange={setSelectedKeys}
        onVectorFSOpenChanges={setIsVectorFSOpen}
        selectedFileKeysRef={selectedFileKeysRef}
        selectedFolderKeysRef={selectedFolderKeysRef}
        selectedKeys={selectedKeys}
      />
      <KnowledgeSearchDrawer
        isKnowledgeSearchOpen={isKnowledgeSearchOpen}
        onSelectedKeysChange={setSelectedKeys}
        selectedFileKeysRef={selectedFileKeysRef}
        selectedKeys={selectedKeys}
        setIsKnowledgeSearchOpen={setIsKnowledgeSearchOpen}
      />
    </div>
  );
};
