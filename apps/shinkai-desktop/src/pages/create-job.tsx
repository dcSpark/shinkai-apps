import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils';
import {
  CreateJobFormSchema,
  createJobFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/create-job';
import {
  SearchVectorFormSchema,
  searchVectorFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/vector-fs/vector-search';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/lib/mutations/createJob/useCreateJob';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/lib/queries/getLLMProviders/useGetLLMProviders';
import {
  VRFolder,
  VRItem,
} from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
import { useGetVRPathSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/useGetVRPathSimplified';
import { Workflow } from '@shinkai_network/shinkai-node-state/lib/queries/getWorkflowSearch/types';
import { useGetWorkflowSearch } from '@shinkai_network/shinkai-node-state/lib/queries/getWorkflowSearch/useGetWorkflowSearch';
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
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  PlusIcon,
  SearchIcon,
  SparkleIcon,
  Sparkles,
  SquareSlash,
  XIcon,
} from 'lucide-react';
import { TreeCheckboxSelectionKeys } from 'primereact/tree';
import { TreeNode } from 'primereact/treenode';
import React, { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

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

    const workflowVersion = selectedWorkflow?.Workflow?.workflow?.version;
    const workflowName = selectedWorkflow?.Workflow?.workflow?.name;

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

  return (
    <SubpageLayout title={t('chat.create')}>
      <Form {...createJobForm}>
        <form
          className="space-y-8"
          onSubmit={createJobForm.handleSubmit(onSubmit)}
        >
          <div className="space-y-6">
            <div>
              <AnimatePresence>
                {!!selectedWorkflow && (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between gap-3 rounded-lg rounded-b-none border border-b-0 px-2.5 py-2 text-xs"
                    exit={{
                      y: -2,
                      transition: { duration: 0.2, ease: 'easeOut' },
                    }}
                    initial={{ opacity: 0, y: -2 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="space-y-1">
                      <h1 className="font-medium text-white">
                        {selectedWorkflow.Workflow.workflow.name}
                      </h1>
                      <p className="text-gray-80 font-medium">
                        {selectedWorkflow.Workflow.workflow.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedWorkflow(undefined);
                        }}
                        type="button"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
                            autoFocus={true}
                            className="placeholder-gray-80 !min-h-[140px] resize-none pb-[40px] text-sm"
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
                                ? ''
                                : "Ask anything or press '/' for workflow commands"
                            }
                          />
                          <motion.div
                            animate={{ opacity: 1 }}
                            className="absolute inset-x-2 bottom-1 flex items-center justify-between gap-2"
                            exit={{
                              opacity: 0,
                            }}
                            initial={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {!!debounceMessage &&
                              isWorkflowRecommendationsSuccess &&
                              workflowRecommendations?.length > 0 && (
                                <div className="flex gap-2">
                                  {workflowRecommendations?.map((workflow) => (
                                    <button
                                      className={cn(
                                        'hover:bg-brand-gradient flex items-center gap-2 rounded-lg border bg-gray-400 px-2 py-1 text-xs text-white',

                                        selectedWorkflow?.Workflow?.workflow
                                          ?.name ===
                                          workflow.Workflow.workflow.name &&
                                          'bg-brand-gradient border-brand border',
                                      )}
                                      key={workflow.Workflow.workflow.name}
                                      onClick={() => {
                                        if (
                                          selectedWorkflow?.Workflow?.workflow
                                            ?.name ===
                                          workflow.Workflow.workflow.name
                                        ) {
                                          setSelectedWorkflow(undefined);
                                          return;
                                        }
                                        setSelectedWorkflow(workflow);
                                      }}
                                      type="button"
                                    >
                                      <Sparkles className="h-3 w-3" />
                                      {workflow.Workflow.workflow.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            <Button
                              className="rounded-lg bg-gray-400 text-white hover:bg-gray-500"
                              onClick={() => setWorkflowSearchDrawerOpen(true)}
                              size="sm"
                              type="button"
                              variant={'ghost'}
                            >
                              <div className="flex items-center gap-1">
                                <SquareSlash className="h-4 w-4" />
                                <span>Explore</span>
                              </div>
                            </Button>
                          </motion.div>
                        </div>
                        <AnimatePresence>
                          {!!debounceMessage &&
                            isWorkflowRecommendationsSuccess &&
                            workflowRecommendations?.length > 0 && (
                              <motion.div
                                animate={{ opacity: 1 }}
                                className="flex gap-2"
                                exit={{
                                  opacity: 0,
                                }}
                                initial={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                {workflowRecommendations.map((workflow) => (
                                  <button
                                    className={cn(
                                      'hover:bg-brand-gradient flex items-center gap-2 rounded-lg bg-gray-400 px-2 py-1 text-xs text-white',

                                      selectedWorkflow?.Workflow?.workflow
                                        ?.name ===
                                        workflow.Workflow.workflow.name &&
                                        'bg-brand-gradient border-brand border',
                                    )}
                                    key={workflow.Workflow.workflow.name}
                                    onClick={() => {
                                      if (
                                        selectedWorkflow?.Workflow?.workflow
                                          ?.name ===
                                        workflow.Workflow.workflow.name
                                      ) {
                                        setSelectedWorkflow(undefined);
                                        return;
                                      }
                                      setSelectedWorkflow(workflow);
                                    }}
                                    type="button"
                                  >
                                    <Sparkles className="h-3 w-3" />
                                    {workflow.Workflow.workflow.name}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                        </AnimatePresence>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
}: {
  selectedWorkflow: Workflow | undefined;
  setSelectedWorkflow: (workflow: Workflow) => void;
  isWorkflowSearchDrawerOpen: boolean;
  setIsWorkflowSearchDrawerOpen: (isOpen: boolean) => void;
}) => {
  const auth = useAuth((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 600);
  const isSearchQuerySynced = searchQuery === debouncedSearchQuery;

  const { isPending, data: workflowRecommendations } = useGetWorkflowSearch(
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

  return (
    <Sheet
      onOpenChange={setIsWorkflowSearchDrawerOpen}
      open={isWorkflowSearchDrawerOpen}
    >
      <SheetContent side="right">
        <SheetHeader className="mb-4">
          <SheetTitle>Workflow Library</SheetTitle>
          <SheetDescription>
            <p>Choose a workflow from the library to get started.</p>
          </SheetDescription>
        </SheetHeader>
        <div className="relative flex h-10 w-full items-center">
          <Input
            className="placeholder-gray-80 !h-full bg-transparent py-2 pl-10"
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            placeholder="Search..."
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
        <ScrollArea className="pr-4 [&>div>div]:!block">
          <div className="divide-y divide-gray-200 py-5">
            {(isPending || !isSearchQuerySynced) &&
              Array.from({ length: 4 }).map((_, idx) => (
                <div
                  className="mb-2 flex h-[70px] items-center justify-between gap-2 rounded-lg bg-gray-300 py-3"
                  key={idx}
                />
              ))}
            {isSearchQuerySynced &&
              workflowRecommendations?.map((workflow) => (
                <button
                  className={cn(
                    'flex w-full flex-col gap-1 rounded-sm px-3 py-2 text-left text-sm hover:bg-gray-300',
                  )}
                  key={workflow.Workflow.workflow.name}
                  onClick={() => {
                    setSelectedWorkflow(workflow);
                    setIsWorkflowSearchDrawerOpen(false);
                  }}
                  type="button"
                >
                  <span className="text-sm font-medium">
                    {workflow.Workflow.workflow.name}{' '}
                    {selectedWorkflow?.Workflow?.workflow?.name ===
                      workflow.Workflow.workflow.name && (
                      <Badge
                        className="bg-brand ml-2 text-gray-50"
                        variant="default"
                      >
                        Selected
                      </Badge>
                    )}
                  </span>
                  <p className="text-gray-80 text-sm">
                    {workflow.Workflow.workflow.description}
                  </p>
                </button>
              ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
