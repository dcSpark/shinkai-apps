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
import { PlusIcon } from 'lucide-react';
import { TreeCheckboxSelectionKeys } from 'primereact/tree';
import { TreeNode } from 'primereact/treenode';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  KnowledgeSearchDrawer,
  VectorFsScopeDrawer,
} from '../components/vector-fs/components/vector-fs-context-drawer';
import config from '../config';
import { allowedFileExtensions } from '../lib/constants';
import { useAnalytics } from '../lib/posthog-provider';
import { ADD_AGENT_PATH } from '../routes/name';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';
import { SubpageLayout } from './layout/simple-layout';

const CreateJobPage = () => {
  const auth = useAuth((state) => state.auth);
  const defaulAgentId = useSettings((state) => state.defaultAgentId);
  const navigate = useNavigate();
  const location = useLocation();
  const { captureAnalyticEvent } = useAnalytics();

  const locationState = location.state as {
    files: File[];
    agentName: string;
    selectedVRFiles: VRItem[];
    selectedVRFolders: VRFolder[];
  };

  const [isVectorFSOpen, setIsVectorFSOpen] = React.useState(false);
  const [isKnowledgeSearchOpen, setIsKnowledgeSearchOpen] =
    React.useState(false);

  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [selectedKeys, setSelectedKeys] =
    useState<TreeCheckboxSelectionKeys | null>(null);

  const selectedFileKeysRef = useRef<Map<string, VRItem>>(new Map());
  const selectedFolderKeysRef = useRef<Map<string, VRFolder>>(new Map());

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

  useEffect(() => {
    if (isVRFilesSuccess) {
      setNodes(transformDataToTreeNodes(VRFiles));
    }
  }, [VRFiles, isVRFilesSuccess]);

  const createJobForm = useForm<CreateJobFormSchema>({
    resolver: zodResolver(createJobFormSchema),
    defaultValues: {
      files: [],
    },
  });

  const { agents, isSuccess } = useAgents({
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

  useEffect(() => {
    if (isSuccess && agents?.length && !defaulAgentId) {
      createJobForm.setValue('agent', agents[0].id);
    } else {
      createJobForm.setValue('agent', defaulAgentId);
    }
  }, [agents, createJobForm, defaulAgentId, isSuccess]);

  useEffect(() => {
    if (!locationState?.agentName) {
      return;
    }
    const agent = agents.find((agent) => agent.id === locationState.agentName);
    if (agent) {
      createJobForm.setValue('agent', agent.id);
    }
  }, [createJobForm, locationState, agents]);

  const { isPending, mutateAsync: createJob } = useCreateJob({
    onSuccess: (data, variables) => {
      // TODO: job_inbox, false is hardcoded
      navigate(
        `/inboxes/${encodeURIComponent(buildInboxIdFromJobId(data.jobId))}`,
      );
      const files = variables?.files ?? [];
      const localFilesCount = (variables.selectedVRFiles ?? [])?.length;
      const localFoldersCount = (variables.selectedVRFolders ?? [])?.length;

      if (localFilesCount > 0 || localFoldersCount > 0) {
        captureAnalyticEvent('Ask Local Files', {
          foldersCount: localFoldersCount,
          filesCount: localFilesCount,
        });
      }
      if (files?.length > 0) {
        captureAnalyticEvent('AI Chat with Files', {
          filesCount: files.length,
        });
      } else {
        captureAnalyticEvent('AI Chat', undefined);
      }
    },
  });

  useEffect(() => {
    if (
      locationState?.selectedVRFiles?.length > 0 ||
      locationState?.selectedVRFolders?.length > 0
    ) {
      const selectedVRFilesPathMap = locationState?.selectedVRFiles?.reduce(
        (acc, file) => {
          selectedFileKeysRef.current.set(file.path, file);
          acc[file.path] = {
            checked: true,
          };
          return acc;
        },
        {} as Record<string, { checked: boolean }>,
      );

      const selectedVRFoldersPathMap = locationState?.selectedVRFolders?.reduce(
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
  }, [locationState?.selectedVRFiles, locationState?.selectedVRFolders]);

  const onSubmit = async (data: CreateJobFormSchema) => {
    if (!auth) return;
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
      agentId: data.agent,
      content: data.content,
      files_inbox: '',
      files: data.files,
      workflow: data.workflow,
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

  // useEffect(() => {
  //   return () => {
  //     file && URL.revokeObjectURL(file.preview);
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <SubpageLayout title="Create AI Chat">
      <Form {...createJobForm}>
        <form
          className="space-y-8"
          onSubmit={createJobForm.handleSubmit(onSubmit)}
        >
          <div className="space-y-6">
            <FormField
              control={createJobForm.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tell us the job you want to do</FormLabel>
                  <FormControl>
                    <Textarea
                      autoFocus={true}
                      className="resize-none"
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' &&
                          (event.metaKey || event.ctrlKey)
                        ) {
                          createJobForm.handleSubmit(onSubmit)();
                        }
                      }}
                      placeholder="Eg: Explain me how internet works..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {config.isInternalUse && (
              <FormField
                control={createJobForm.control}
                name="workflow"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workflows</FormLabel>
                    <FormControl>
                      <Textarea
                        autoFocus={true}
                        className="resize-none"
                        placeholder="Workflow"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={createJobForm.control}
              name="agent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select your AI</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your AI" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {agents?.length ? (
                        agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            <span>{agent.id} </span>
                          </SelectItem>
                        ))
                      ) : (
                        <Button
                          onClick={() => {
                            navigate(ADD_AGENT_PATH);
                          }}
                          variant="ghost"
                        >
                          <PlusIcon className="mr-2" />
                          Add AI
                        </Button>
                      )}
                    </SelectContent>
                  </Select>
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
                  control={createJobForm.control}
                  name="files"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Upload a file</FormLabel>
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
          </div>
          <Button
            className="w-full"
            disabled={isPending}
            isLoading={isPending}
            type="submit"
          >
            Create AI Chat
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
    </SubpageLayout>
  );
};
export default CreateJobPage;
