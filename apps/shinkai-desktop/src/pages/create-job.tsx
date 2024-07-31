import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils';
import {
  CreateJobFormSchema,
  createJobFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/create-job';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/lib/mutations/createJob/useCreateJob';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/lib/queries/getLLMProviders/useGetLLMProviders';
import {
  VRFolder,
  VRItem,
} from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
import { useGetVRPathSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/useGetVRPathSimplified';
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
  WorkflowPlaygroundIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { PlusIcon, XIcon } from 'lucide-react';
import { TreeCheckboxSelectionKeys } from 'primereact/tree';
import { TreeNode } from 'primereact/treenode';
import React, { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  KnowledgeSearchDrawer,
  VectorFsScopeDrawer,
} from '../components/vector-fs/components/vector-fs-context-drawer';
import { useWorkflowSelectionStore } from '../components/workflow/context/workflow-selection-context';
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
  const workflowSelected = useWorkflowSelectionStore(
    (state) => state.workflowSelected,
  );
  const setWorkflowSelected = useWorkflowSelectionStore(
    (state) => state.setWorkflowSelected,
  );
  const setWorkflowSelectionDrawerOpen = useWorkflowSelectionStore(
    (state) => state.setWorkflowSelectionDrawerOpen,
  );
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

    const workflowVersion = workflowSelected?.version;
    const workflowName = workflowSelected?.name;

    await createJob({
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth.shinkai_identity,
      profile: auth.profile,
      agentId: data.agent,
      content: data.content,
      files_inbox: '',
      files: data.files,
      workflow: data.workflow,
      workflowName: workflowSelected
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
  const currentFiles = useWatch({
    control: createJobForm.control,
    name: 'files',
  });

  const debounceMessage = useDebounce(currentMessage, 500);

  const isWorkflowSelectedAndFilesPresent =
    workflowSelected &&
    (Object.keys(selectedKeys ?? {}).length > 0 || currentFiles?.length > 0);

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
    if (currentMessage?.length === 1 && currentMessage === '/') {
      setWorkflowSelectionDrawerOpen(true);
    }
  }, [currentMessage]);

  useEffect(() => {
    if (
      Object.keys(selectedKeys ?? {}).length > 0 ||
      currentMessage?.endsWith('/')
    ) {
      createJobForm.setValue('content', '');
    }
  }, [workflowSelected]);

  useEffect(() => {
    if (isWorkflowSelectedAndFilesPresent) {
      createJobForm.setValue(
        'content',
        `${formatWorkflowName(workflowSelected.name)} - ${workflowSelected.description}`,
      );
    }
  }, [
    createJobForm,
    isWorkflowSelectedAndFilesPresent,
    selectedKeys,
    workflowSelected,
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
                              workflowSelected
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
                            <div className="flex gap-2 bg-gray-400">
                              {!!debounceMessage &&
                                !workflowSelected &&
                                isWorkflowRecommendationsSuccess &&
                                workflowRecommendations?.length > 0 &&
                                workflowRecommendations?.map((workflow) => (
                                  <motion.button
                                    animate={{ opacity: 1, x: 0 }}
                                    className={cn(
                                      'hover:bg-brand-gradient bg-gray-350 flex items-center gap-2 rounded-lg px-2 py-1 text-xs text-white',
                                    )}
                                    exit={{ opacity: 0, x: -10 }}
                                    initial={{ opacity: 0, x: -10 }}
                                    key={workflow.Workflow.workflow.name}
                                    onClick={() => {
                                      setWorkflowSelected({
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
                                    <WorkflowPlaygroundIcon className="h-3 w-3" />
                                    {formatWorkflowName(
                                      workflow.Workflow.workflow.name,
                                    )}
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
                  {workflowSelected ? (
                    <motion.button
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-gray-350 relative flex flex-col gap-3 rounded-lg border p-2 py-2.5 text-left transition-colors"
                      exit={{ opacity: 0, y: -2 }}
                      initial={{ opacity: 0, y: -2 }}
                      onClick={() => setWorkflowSelectionDrawerOpen(true)}
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
                                <WorkflowPlaygroundIcon className="h-4 w-4" />
                                <span className="text-gray-80 line-clamp-1 font-medium">
                                  <span className="text-sm text-white">
                                    {formatWorkflowName(workflowSelected.name)}:{' '}
                                  </span>
                                  <span className="">
                                    {workflowSelected.description}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipPortal>
                            <TooltipContent
                              align="end"
                              alignOffset={-10}
                              className="max-w-[420px]"
                              side="top"
                              sideOffset={18}
                            >
                              {workflowSelected.description}
                            </TooltipContent>
                          </TooltipPortal>
                        </Tooltip>
                      </TooltipProvider>

                      <button
                        className="absolute right-2 top-2 p-1"
                        onClick={(event) => {
                          setWorkflowSelected(undefined);
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
                      onClick={() => setWorkflowSelectionDrawerOpen(true)}
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
    </SubpageLayout>
  );
};
export default CreateJobPage;
