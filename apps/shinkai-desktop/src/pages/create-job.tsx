import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils';
import {
  CreateJobFormSchema,
  createJobFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/create-job';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/lib/mutations/createJob/useCreateJob';
import { useCreateWorkflow } from '@shinkai_network/shinkai-node-state/lib/mutations/createWorkflow/useCreateWorkflow';
import { useRemoveWorkflow } from '@shinkai_network/shinkai-node-state/lib/mutations/removeWorkflow/useRemoveWorkflow';
import { useUpdateWorkflow } from '@shinkai_network/shinkai-node-state/lib/mutations/updateWorkflow/useUpdateWorkflow';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/lib/queries/getLLMProviders/useGetLLMProviders';
import {
  VRFolder,
  VRItem,
} from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
import { useGetVRPathSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/useGetVRPathSimplified';
import { Workflow } from '@shinkai_network/shinkai-node-state/lib/queries/getWorkflowList/types';
import { useGetWorkflowList } from '@shinkai_network/shinkai-node-state/lib/queries/getWorkflowList/useGetWorkflowList';
import { useGetWorkflowSearch } from '@shinkai_network/shinkai-node-state/lib/queries/getWorkflowSearch/useGetWorkflowSearch';
import { transformDataToTreeNodes } from '@shinkai_network/shinkai-node-state/lib/utils/files';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FileUploader,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Textarea,
  TextField,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  AISearchContentIcon,
  FilesIcon,
  WorkflowPlaygroundIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Edit3Icon,
  PlusIcon,
  SearchIcon,
  Sparkles,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { TreeCheckboxSelectionKeys } from 'primereact/tree';
import { TreeNode } from 'primereact/treenode';
import React, { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  KnowledgeSearchDrawer,
  VectorFsScopeDrawer,
} from '../components/vector-fs/components/vector-fs-context-drawer';
import { useDebounce } from '../hooks/use-debounce';
import { allowedFileExtensions } from '../lib/constants';
import { useAnalytics } from '../lib/posthog-provider';
import { ADD_AGENT_PATH } from '../routes/name';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';
import { SubpageLayout } from './layout/simple-layout';

export const formatWorkflowName = (text: string) => {
  const words = text.split('_');

  const formattedWords = words.map((word) => {
    return word
      .split(/(?=[A-Z])/)
      .map((part) => {
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      })
      .join(' ');
  });

  // Join all the processed words
  return formattedWords.join(' ');
};

const CreateJobPage = () => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const defaulAgentId = useSettings((state) => state.defaultAgentId);
  const navigate = useNavigate();
  const location = useLocation();
  const { captureAnalyticEvent } = useAnalytics();
  const [isWorkflowSearchDrawerOpen, setWorkflowSearchDrawerOpen] =
    useState(false);

  const locationState = location.state as {
    files: File[];
    agentName: string;
    selectedVRFiles: VRItem[];
    selectedVRFolders: VRFolder[];
  };

  const [isVectorFSOpen, setIsVectorFSOpen] = React.useState(false);
  const [isKnowledgeSearchOpen, setIsKnowledgeSearchOpen] =
    React.useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<
    Workflow | undefined
  >(undefined);
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

  const { llmProviders, isSuccess } = useGetLLMProviders({
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
    if (isSuccess && llmProviders?.length && !defaulAgentId) {
      createJobForm.setValue('agent', llmProviders[0].id);
    } else {
      createJobForm.setValue('agent', defaulAgentId);
    }
  }, [llmProviders, createJobForm, defaulAgentId, isSuccess]);

  useEffect(() => {
    if (!locationState?.agentName) {
      return;
    }
    const agent = llmProviders.find(
      (agent) => agent.id === locationState.agentName,
    );
    if (agent) {
      createJobForm.setValue('agent', agent.id);
    }
  }, [createJobForm, locationState, llmProviders]);

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

    const workflowVersion = selectedWorkflow?.version;
    const workflowName = selectedWorkflow?.name;

    await createJob({
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth.shinkai_identity,
      profile: auth.profile,
      agentId: data.agent,
      content: data.content,
      files_inbox: '',
      files: data.files,
      workflow: data.workflow,
      workflowName: selectedWorkflow
        ? `${workflowName}:::${workflowVersion}`
        : undefined,
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

  const currentMessage = useWatch({
    control: createJobForm.control,
    name: 'content',
  });

  const debounceMessage = useDebounce(currentMessage, 500);

  const isWorkflowSelectedAndFilesPresent =
    selectedWorkflow && Object.keys(selectedKeys ?? {}).length > 0;

  const {
    data: workflowRecommendations,
    isSuccess: isWorkflowRecommendationsSuccess,
  } = useGetWorkflowSearch(
    {
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      profile: auth?.profile ?? '',
      search: debounceMessage,
      my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
      my_device_identity_sk: auth?.my_device_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    },
    {
      enabled: !!debounceMessage && !!currentMessage,
      select: (data) => data.slice(0, 3),
    },
  );

  useEffect(() => {
    if (currentMessage?.endsWith('/')) {
      setWorkflowSearchDrawerOpen(true);
    }
  }, [currentMessage]);

  useEffect(() => {
    if (isWorkflowSelectedAndFilesPresent) {
      createJobForm.setValue(
        'content',
        `${formatWorkflowName(selectedWorkflow.name)} - ${selectedWorkflow.description}`,
      );
    }
  }, [
    createJobForm,
    isWorkflowSelectedAndFilesPresent,
    selectedKeys,
    selectedWorkflow,
  ]);

  return (
    <SubpageLayout title={t('chat.create')}>
      <Form {...createJobForm}>
        <form
          className="space-y-8"
          onSubmit={createJobForm.handleSubmit(onSubmit)}
        >
          <div className="space-y-6">
            <div>
              <FormField
                control={createJobForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="relative">
                          <Textarea
                            autoFocus
                            className={cn(
                              'placeholder-gray-80 resize-none pb-[40px] text-sm',
                              isWorkflowSelectedAndFilesPresent &&
                                'w-full overflow-hidden truncate pb-0 text-xs',
                            )}
                            disabled={isWorkflowSelectedAndFilesPresent}
                            onKeyDown={(event) => {
                              if (
                                event.key === 'Enter' &&
                                (event.metaKey || event.ctrlKey)
                              ) {
                                createJobForm.handleSubmit(onSubmit)();
                                return;
                              }
                            }}
                            spellCheck={false}
                            {...field}
                            placeholder={
                              selectedWorkflow
                                ? 'Enter your prompt'
                                : "Ask anything or press '/' for workflow commands"
                            }
                          />
                          <motion.div
                            animate={{ opacity: 1 }}
                            className="absolute inset-x-3 bottom-2 flex items-center justify-between gap-2"
                            exit={{ opacity: 0 }}
                            initial={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex gap-2">
                              {!!debounceMessage &&
                                !selectedWorkflow &&
                                isWorkflowRecommendationsSuccess &&
                                workflowRecommendations?.length > 0 &&
                                workflowRecommendations?.map((workflow) => (
                                  <motion.button
                                    animate={{ opacity: 1, x: 0 }}
                                    className={cn(
                                      'hover:bg-brand-gradient flex items-center gap-2 rounded-lg border bg-gray-400 px-2 py-1 text-xs text-white',
                                      'border border-gray-100',
                                    )}
                                    exit={{ opacity: 0, x: -10 }}
                                    initial={{ opacity: 0, x: -10 }}
                                    key={workflow.Workflow.workflow.name}
                                    onClick={() => {
                                      setSelectedWorkflow({
                                        description:
                                          workflow.Workflow.workflow
                                            .description,
                                        name: workflow.Workflow.workflow.name,
                                        raw: workflow.Workflow.workflow.raw,
                                        version:
                                          workflow.Workflow.workflow.version,
                                      });
                                      if (
                                        Object.keys(selectedKeys ?? {}).length >
                                          0 ||
                                        currentMessage.endsWith('/')
                                      ) {
                                        createJobForm.setValue('content', '');
                                      }
                                    }}
                                    type="button"
                                  >
                                    <Sparkles className="h-3 w-3" />
                                    {workflow.Workflow.workflow.name}
                                  </motion.button>
                                ))}
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <div className="relative flex flex-col gap-1 rounded-lg bg-gray-400 px-3.5 py-2.5 text-xs">
                <span className="mb-2 text-xs font-medium leading-tight text-gray-100">
                  Workflow (optional)
                </span>
                <AnimatePresence>
                  {selectedWorkflow ? (
                    <motion.button
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-gray-350 relative mb-2 flex flex-col gap-3 rounded-lg border p-2 py-2.5 text-left transition-colors"
                      exit={{ opacity: 0, y: -2 }}
                      initial={{ opacity: 0, y: -2 }}
                      onClick={() => setWorkflowSearchDrawerOpen(true)}
                      transition={{ duration: 0.3 }}
                      type="button"
                    >
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger
                            className="flex text-left"
                            type="button"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 pr-6">
                                <WorkflowPlaygroundIcon className="h-3.5 w-3.5" />
                                <span className="text-gray-80 line-clamp-1 font-medium">
                                  <span className="text-sm text-white">
                                    {formatWorkflowName(selectedWorkflow.name)}:{' '}
                                  </span>
                                  <span className="">
                                    {selectedWorkflow.description}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipPortal>
                            <TooltipContent
                              align="start"
                              alignOffset={-10}
                              className="max-w-[200px]"
                              side="right"
                              sideOffset={18}
                            >
                              {selectedWorkflow.description}
                            </TooltipContent>
                          </TooltipPortal>
                        </Tooltip>
                      </TooltipProvider>

                      <button
                        className="absolute right-2 top-2.5"
                        onClick={(event) => {
                          setSelectedWorkflow(undefined);
                          if (Object.keys(selectedKeys ?? {}).length > 0) {
                            createJobForm.setValue('content', '');
                          }
                          event.stopPropagation();
                        }}
                        type="button"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </motion.button>
                  ) : (
                    <Button
                      className="hover:bg-gray-350 flex h-[40px] items-center justify-start gap-2 rounded-lg p-2.5 text-left"
                      onClick={() => setWorkflowSearchDrawerOpen(true)}
                      size="auto"
                      type="button"
                      variant="outline"
                    >
                      <WorkflowPlaygroundIcon className="h-4 w-4" />
                      <p className="text-sm text-white">Workflow Library</p>
                    </Button>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <FormField
              control={createJobForm.control}
              name="agent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('chat.form.selectAI')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('chat.form.selectAI')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {llmProviders?.length ? (
                        llmProviders.map((agent) => (
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
                          {t('llmProviders.add')}
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
                    {t('chat.form.setContext')}
                  </h2>
                  <p className="text-gray-80 text-xs">
                    {t('chat.form.setContextText')}
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
                          {t('aiFilesSearch.label')}
                        </p>
                      </Button>
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent sideOffset={0}>
                        {t('aiFilesSearch.label')}
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
                    <p className="text-sm text-white">
                      {t('vectorFs.localFiles')}
                    </p>
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
                      <FormLabel className="sr-only">
                        {t('common.uploadFile')}
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
          </div>
          <Button
            className="w-full"
            disabled={isPending}
            isLoading={isPending}
            type="submit"
          >
            {t('chat.create')}
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
      <WorkflowSearchDrawer
        isWorkflowSearchDrawerOpen={isWorkflowSearchDrawerOpen}
        onSelectWorkflow={() => {
          if (
            Object.keys(selectedKeys ?? {}).length > 0 ||
            currentMessage.endsWith('/')
          ) {
            createJobForm.setValue('content', '');
          }
        }}
        selectedWorkflow={selectedWorkflow}
        setIsWorkflowSearchDrawerOpen={setWorkflowSearchDrawerOpen}
        setSelectedWorkflow={setSelectedWorkflow}
      />
    </SubpageLayout>
  );
};
export default CreateJobPage;

const WorkflowSearchDrawer = ({
  selectedWorkflow,
  setSelectedWorkflow,
  isWorkflowSearchDrawerOpen,
  setIsWorkflowSearchDrawerOpen,
  onSelectWorkflow,
}: {
  selectedWorkflow: Workflow | undefined;
  setSelectedWorkflow: (workflow: Workflow) => void;
  isWorkflowSearchDrawerOpen: boolean;
  setIsWorkflowSearchDrawerOpen: (isOpen: boolean) => void;
  onSelectWorkflow?: (workflow: Workflow) => void;
}) => {
  const auth = useAuth((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 600);
  const isSearchQuerySynced = searchQuery === debouncedSearchQuery;
  const [selectedWorkflowEdit, setSelectedWorkflowEdit] =
    useState<Workflow | null>(null);

  const { isPending, data: workflowList } = useGetWorkflowList({
    nodeAddress: auth?.node_address ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const { data: searchWorkflowList, isPending: isSearchWorkflowListPending } =
    useGetWorkflowSearch(
      {
        nodeAddress: auth?.node_address ?? '',
        shinkaiIdentity: auth?.shinkai_identity ?? '',
        profile: auth?.profile ?? '',
        search: debouncedSearchQuery,
        my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
        my_device_identity_sk: auth?.my_device_identity_sk ?? '',
        node_encryption_pk: auth?.node_encryption_pk ?? '',
        profile_encryption_sk: auth?.profile_encryption_sk ?? '',
        profile_identity_sk: auth?.profile_identity_sk ?? '',
      },
      {
        enabled: !!isSearchQuerySynced,
      },
    );

  const { mutateAsync: removeWorkflow } = useRemoveWorkflow({
    onSuccess: () => {
      toast.success('Workflow removed successfully');
    },
    onError: (error) => {
      toast.error('Failed to remove workflow', {
        description: error.message,
      });
    },
  });

  return (
    <Sheet
      onOpenChange={setIsWorkflowSearchDrawerOpen}
      open={isWorkflowSearchDrawerOpen}
    >
      <SheetContent side="right">
        <CreateWorkflowDrawer />
        <SheetHeader className="mb-4 p-0">
          <SheetTitle>Workflow Library</SheetTitle>
          <SheetDescription>
            <p>Choose a workflow from the library to get started.</p>
          </SheetDescription>
        </SheetHeader>
        <div className="relative mb-4 flex h-10 w-full items-center">
          <Input
            className="placeholder-gray-80 !h-full bg-transparent py-2 pl-10"
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            placeholder="Search..."
            spellCheck={false}
            value={searchQuery}
          />
          <SearchIcon className="absolute left-4 top-1/2 -z-[1px] h-4 w-4 -translate-y-1/2" />
          {searchQuery && (
            <Button
              className="absolute right-1 h-8 w-8 bg-gray-200 p-2"
              onClick={() => {
                setSearchQuery('');
              }}
              size="auto"
              type="button"
              variant="ghost"
            >
              <XIcon />
              <span className="sr-only">Clear Search</span>
            </Button>
          )}
        </div>
        <ScrollArea className="h-[calc(100vh-140px)] pr-4 [&>div>div]:!block">
          <div className="divide-y divide-gray-200 py-5">
            {(isPending ||
              !isSearchQuerySynced ||
              isSearchWorkflowListPending) &&
              Array.from({ length: 4 }).map((_, idx) => (
                <div
                  className="mb-2 flex h-[70px] items-center justify-between gap-2 rounded-lg bg-gray-300 py-3"
                  key={idx}
                />
              ))}
            {!searchQuery &&
              isSearchQuerySynced &&
              workflowList?.map((workflow) => (
                <div
                  className={cn(
                    'group relative flex min-h-[70px] w-full flex-col gap-1 rounded-sm px-3 py-2.5 pr-8 text-left text-sm hover:bg-gray-300',
                  )}
                  key={workflow.name}
                  onClick={() => {
                    setSelectedWorkflow(workflow);
                    setIsWorkflowSearchDrawerOpen(false);
                    onSelectWorkflow?.(workflow);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="absolute right-1 top-1 flex translate-x-[150%] items-center gap-0.5 transition duration-200 group-hover:translate-x-0">
                    <button
                      className="text-gray-80 rounded-full p-2 transition-colors hover:bg-gray-400 hover:text-white"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedWorkflowEdit(workflow);
                      }}
                      type="button"
                    >
                      <Edit3Icon className="h-4 w-4" />
                    </button>

                    <button
                      className="text-gray-80 rounded-full p-2 transition-colors hover:bg-gray-400 hover:text-white"
                      onClick={async (event) => {
                        event.stopPropagation();
                        await removeWorkflow({
                          profile: auth?.profile ?? '',
                          nodeAddress: auth?.node_address ?? '',
                          shinkaiIdentity: auth?.shinkai_identity ?? '',
                          workflowKey: `${workflow.name}:::${workflow.version}`,
                          my_device_encryption_sk:
                            auth?.profile_encryption_sk ?? '',
                          my_device_identity_sk:
                            auth?.profile_identity_sk ?? '',
                          node_encryption_pk: auth?.node_encryption_pk ?? '',
                          profile_encryption_sk:
                            auth?.profile_encryption_sk ?? '',
                          profile_identity_sk: auth?.profile_identity_sk ?? '',
                        });
                      }}
                      type="button"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm font-medium">
                    {formatWorkflowName(workflow.name)}{' '}
                    {selectedWorkflow?.name === workflow.name && (
                      <Badge
                        className="bg-brand ml-2 text-gray-50"
                        variant="default"
                      >
                        Selected
                      </Badge>
                    )}
                  </span>
                  <p className="text-gray-80 text-xs">{workflow.description}</p>
                </div>
              ))}
            {searchQuery &&
              isSearchQuerySynced &&
              searchWorkflowList?.map((workflow) => (
                <button
                  className={cn(
                    'flex w-full flex-col gap-1 rounded-sm px-3 py-2 text-left text-sm hover:bg-gray-300',
                  )}
                  key={workflow.Workflow.workflow.name}
                  onClick={() => {
                    setSelectedWorkflow({
                      description: workflow.Workflow.workflow.description,
                      name: workflow.Workflow.workflow.name,
                      raw: workflow.Workflow.workflow.raw,
                      version: workflow.Workflow.workflow.version,
                    });
                    setIsWorkflowSearchDrawerOpen(false);
                  }}
                  type="button"
                >
                  <span className="text-sm font-medium">
                    {formatWorkflowName(workflow.Workflow.workflow.name)}{' '}
                    {selectedWorkflow?.name ===
                      workflow.Workflow.workflow.name && (
                      <Badge
                        className="bg-brand ml-2 font-light text-gray-50 shadow-none"
                        variant="default"
                      >
                        Current
                      </Badge>
                    )}
                  </span>
                  <p className="text-gray-80 text-sm">
                    {workflow.Workflow.workflow.description}
                  </p>
                </button>
              ))}
            {searchQuery &&
              isSearchQuerySynced &&
              searchWorkflowList?.length === 0 && (
                <div className="flex h-20 items-center justify-center">
                  <p className="text-gray-80 text-sm">
                    No workflows found for the search query
                  </p>
                </div>
              )}
          </div>
        </ScrollArea>
        {selectedWorkflowEdit && (
          <UpdateWorkflowDrawer
            open={!!selectedWorkflowEdit}
            setOpen={(open) => {
              if (!open) {
                setSelectedWorkflowEdit(null);
              }
            }}
            workflowDescription={selectedWorkflowEdit.description}
            workflowRaw={selectedWorkflowEdit.raw}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};

const createWorkflowFormSchema = z.object({
  workflowRaw: z.string().min(1, 'Workflow code is required'),
  workflowDescription: z.string().min(1, 'Workflow description is required'),
});

type CreateWorkflowFormSchema = z.infer<typeof createWorkflowFormSchema>;

function CreateWorkflowDrawer() {
  const auth = useAuth((state) => state.auth);
  const createWorkflowForm = useForm<CreateWorkflowFormSchema>({
    resolver: zodResolver(createWorkflowFormSchema),
  });
  const [isWorkflowDrawerOpen, setIsWorkflowDrawerOpen] = useState(false);

  const { mutateAsync: createWorkflow, isPending } = useCreateWorkflow({
    onSuccess: () => {
      toast.success('Workflow created successfully');
      setIsWorkflowDrawerOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create workflow', {
        description: error.message,
      });
    },
  });

  const onSubmit = async (data: CreateWorkflowFormSchema) => {
    await createWorkflow({
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      profile: auth?.profile ?? '',
      workflowRaw: data.workflowRaw,
      workflowDescription: data.workflowDescription ?? '',
      my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
      my_device_identity_sk: auth?.profile_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    });
  };
  return (
    <Dialog onOpenChange={setIsWorkflowDrawerOpen} open={isWorkflowDrawerOpen}>
      <DialogTrigger asChild>
        <button
          className="bg-brand absolute right-12 top-2 rounded-full p-2"
          type="button"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-gray-500">
        <DialogHeader>
          <DialogTitle>Create custom workflow</DialogTitle>

          <div>
            <Form {...createWorkflowForm}>
              <form
                className="mt-5 flex flex-col gap-3"
                onSubmit={createWorkflowForm.handleSubmit(onSubmit)}
              >
                <FormField
                  control={createWorkflowForm.control}
                  name="workflowRaw"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workflow Code</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Textarea
                            autoFocus={true}
                            className="!min-h-[130px] resize-none text-sm"
                            onKeyDown={(event) => {
                              if (
                                event.key === 'Enter' &&
                                (event.metaKey || event.ctrlKey)
                              ) {
                                createWorkflowForm.handleSubmit(onSubmit)();
                                return;
                              }
                            }}
                            spellCheck={false}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createWorkflowForm.control}
                  name="workflowDescription"
                  render={({ field }) => (
                    <TextField
                      autoFocus
                      field={field}
                      label="Workflow Description"
                    />
                  )}
                />
                <Button
                  className="mt-4"
                  disabled={isPending}
                  isLoading={isPending}
                  type="submit"
                >
                  Create Workflow
                </Button>
              </form>
            </Form>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
function UpdateWorkflowDrawer({
  workflowRaw,
  workflowDescription,
  open,
  setOpen,
}: {
  workflowRaw: string;
  workflowDescription: string;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
}) {
  const auth = useAuth((state) => state.auth);
  const createWorkflowForm = useForm<CreateWorkflowFormSchema>({
    resolver: zodResolver(createWorkflowFormSchema),
    defaultValues: {
      workflowDescription,
      workflowRaw,
    },
  });

  const { mutateAsync: updateWorkflow, isPending } = useUpdateWorkflow({
    onSuccess: () => {
      toast.success('Workflow updated successfully');
      setOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to update workflow', {
        description: error.message,
      });
    },
  });

  const onSubmit = async (data: CreateWorkflowFormSchema) => {
    await updateWorkflow({
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      profile: auth?.profile ?? '',
      workflowRaw: data.workflowRaw,
      workflowDescription: data.workflowDescription ?? '',
      my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
      my_device_identity_sk: auth?.profile_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    });
  };
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="bg-gray-500">
        <DialogHeader>
          <DialogTitle>Update workflow</DialogTitle>
          <div>
            <Form {...createWorkflowForm}>
              <form
                className="mt-5 flex flex-col gap-3"
                onSubmit={createWorkflowForm.handleSubmit(onSubmit)}
              >
                <FormField
                  control={createWorkflowForm.control}
                  name="workflowRaw"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workflow Code</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Textarea
                            className="!min-h-[130px] resize-none text-sm"
                            onKeyDown={(event) => {
                              if (
                                event.key === 'Enter' &&
                                (event.metaKey || event.ctrlKey)
                              ) {
                                createWorkflowForm.handleSubmit(onSubmit)();
                                return;
                              }
                            }}
                            spellCheck={false}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createWorkflowForm.control}
                  name="workflowDescription"
                  render={({ field }) => (
                    <TextField
                      autoFocus
                      field={field}
                      label="Workflow Description"
                    />
                  )}
                />
                <Button
                  className="mt-4"
                  disabled={isPending}
                  isLoading={isPending}
                  type="submit"
                >
                  Update Workflow
                </Button>
              </form>
            </Form>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
