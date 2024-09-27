import { zodResolver } from '@hookform/resolvers/zod';
import { DialogClose } from '@radix-ui/react-dialog';
import { ChevronRightIcon, StopIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { getTool } from '@shinkai_network/shinkai-message-ts/api/tools/index';
import { ShinkaiTool } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import {
  buildInboxIdFromJobId,
  extractJobIdFromInbox,
} from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import {
  CreateJobFormSchema,
  CreateJobPlaygroundFormSchema,
  createJobPlaygroundFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/create-job';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob';
import { useCreateWorkflow } from '@shinkai_network/shinkai-node-state/v2/mutations/createWorkflow/useCreateWorkflow';
import { useStopGeneratingLLM } from '@shinkai_network/shinkai-node-state/v2/mutations/stopGeneratingLLM/useStopGeneratingLLM';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import { useGetWorkflowList } from '@shinkai_network/shinkai-node-state/v2/queries/getWorkflowList/useGetWorkflowList';
import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Dialog,
  DialogContent,
  DialogFooter,
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
  MarkdownPreview,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  AISearchContentIcon,
  FilesIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import {
  CirclePlayIcon,
  GalleryHorizontal,
  GalleryVertical,
  MoveLeft,
  MoveRight,
  PlusIcon,
  TrashIcon,
} from 'lucide-react';
import { InfoCircleIcon } from 'primereact/icons/infocircle';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { allowedFileExtensions } from '../../lib/constants';
import { useAnalytics } from '../../lib/posthog-provider';
import {
  CreateWorkflowFormSchema,
  createWorkflowFormSchema,
  useStopGenerationPlayground,
} from '../../pages/workflow-playground';
import { ADD_AGENT_PATH } from '../../routes/name';
import { useAuth } from '../../store/auth';
import { useExperimental } from '../../store/experimental';
import { useSettings } from '../../store/settings';
import { useSetJobScope } from '../chat/context/set-job-scope-context';
import { isWorkflowShinkaiTool } from '../tools/tool-details';
import { WORKFLOW_EXAMPLES } from './constants';

function WorkflowEditor() {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const workflowHistory = useExperimental((state) => state.workflowHistory);
  const addWorkflowHistory = useExperimental(
    (state) => state.addWorkflowHistory,
  );
  const { isLoadingMessage } = useStopGenerationPlayground();
  const { mutateAsync: stopGenerating } = useStopGeneratingLLM();
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);

  const [saveWorkflowDialogOpen, setWorkflowDialogOpen] = useState(false);

  const clearWorkflowHistory = useExperimental(
    (state) => state.clearWorkflowHistory,
  );
  const defaulAgentId = useSettings((state) => state.defaultAgentId);
  const navigate = useNavigate();

  const { data: workflowList } = useGetWorkflowList(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
    },
    {
      select: (data) =>
        data.filter((workflow) => !workflow.name.includes('baml_')),
    },
  );

  const [openWorkflowList, setOpenWorkflowList] = useState(false);

  const [isTwoColumnLayout, setIsTwoColumnLayout] = useState(true);

  const { captureAnalyticEvent } = useAnalytics();
  const [currentWorkflowIndex, setCurrentWorkflowIndex] = useState(-1);

  const setSetJobScopeOpen = useSetJobScope(
    (state) => state.setSetJobScopeOpen,
  );

  const setKnowledgeSearchOpen = useSetJobScope(
    (state) => state.setKnowledgeSearchOpen,
  );

  const selectedKeys = useSetJobScope((state) => state.selectedKeys);

  const selectedFileKeysRef = useSetJobScope(
    (state) => state.selectedFileKeysRef,
  );
  const selectedFolderKeysRef = useSetJobScope(
    (state) => state.selectedFolderKeysRef,
  );

  const createJobPlaygroundForm = useForm<CreateJobPlaygroundFormSchema>({
    resolver: zodResolver(createJobPlaygroundFormSchema),
    defaultValues: {
      files: [],
    },
  });

  const createWorkflowForm = useForm<CreateWorkflowFormSchema>({
    resolver: zodResolver(createWorkflowFormSchema),
  });

  const { llmProviders, isSuccess } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  useEffect(() => {
    if (isSuccess && llmProviders?.length && !defaulAgentId) {
      createJobPlaygroundForm.setValue('agent', llmProviders[0].id);
    } else {
      createJobPlaygroundForm.setValue('agent', defaulAgentId);
    }
  }, [llmProviders, createJobPlaygroundForm, defaulAgentId, isSuccess]);

  const { isPending, mutateAsync: createJob } = useCreateJob({
    onSuccess: (data, variables) => {
      navigate(
        `/workflow-playground/${encodeURIComponent(buildInboxIdFromJobId(data.jobId))}`,
      );

      addWorkflowHistory(variables.workflowCode as string);

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
    onError: (error) => {
      toast.error('Failed to create job', {
        description: error?.response?.data?.message ?? error.message,
      });
    },
  });

  useEffect(() => {
    setCurrentWorkflowIndex(workflowHistory.size - 1);
  }, [workflowHistory.size]);

  const onSubmit = async (data: CreateJobFormSchema) => {
    if (!auth) return;
    const selectedVRFiles =
      selectedFileKeysRef.size > 0
        ? Array.from(selectedFileKeysRef.values())
        : [];
    const selectedVRFolders =
      selectedFolderKeysRef.size > 0
        ? Array.from(selectedFolderKeysRef.values())
        : [];

    await createJob({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      llmProvider: data.agent,
      content: data.message,
      files: data.files,
      workflowCode: data.workflow,
      isHidden: true,
      selectedVRFiles,
      selectedVRFolders,
    });
  };
  const { mutateAsync: createWorkflow, isPending: isCreateWorkflowPending } =
    useCreateWorkflow({
      onSuccess: () => {
        toast.success('Workflow saved successfully');
        setWorkflowDialogOpen(false);
      },
      onError: (error) => {
        toast.error('Failed to save workflow', {
          description: error?.response?.data?.message ?? error.message,
        });
      },
    });

  const onWorkflowChange = useCallback(
    (value: string) => {
      createJobPlaygroundForm.setValue('workflow', value);
    },
    [createJobPlaygroundForm],
  );

  const handleWorkflowKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();

        const textarea = e.currentTarget;
        const { selectionStart, selectionEnd } = textarea;
        const currentValue = textarea.value;

        const lineStart =
          currentValue.lastIndexOf('\n', selectionStart - 1) + 1;
        const lineEnd = currentValue.indexOf('\n', selectionStart);
        const currentLine = currentValue.substring(
          lineStart,
          lineEnd === -1 ? currentValue.length : lineEnd,
        );
        const indent = currentLine?.match(/^\s*/)?.[0];

        const newValue =
          currentValue.substring(0, selectionStart) +
          '\n' +
          indent +
          currentValue.substring(selectionEnd);

        onWorkflowChange(newValue);

        // wait update before we can set the selection
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            selectionStart + (indent ?? '').length + 1;
        }, 0);
      }
    },
    [onWorkflowChange],
  );

  const handleWorkflowScriptChange = (script: string) => {
    const selectedWorkflowExample = WORKFLOW_EXAMPLES[script];
    createJobPlaygroundForm.setValue(
      'message',
      selectedWorkflowExample.message,
    );
    createJobPlaygroundForm.setValue(
      'workflow',
      selectedWorkflowExample.workflow,
    );
  };

  const handleWorkflowSave = async (data: CreateWorkflowFormSchema) => {
    await createWorkflow({
      token: auth?.api_v2_key ?? '',
      nodeAddress: auth?.node_address ?? '',
      raw: data.workflowRaw ?? '',
      description: data.workflowDescription,
    });
  };

  const handleUseTemplate = async (toolRouterKey: string) => {
    if (!auth) return;
    const workflowInfo = await getTool(
      auth?.node_address,
      auth?.api_v2_key,
      toolRouterKey,
    );
    const tool = workflowInfo.content?.[0] as ShinkaiTool;

    if (isWorkflowShinkaiTool(tool)) {
      createJobPlaygroundForm.setValue('workflow', tool.workflow.raw);
      setOpenWorkflowList(false);
    }
  };

  const onStopGenerating = async () => {
    if (!inboxId) return;
    const decodedInboxId = decodeURIComponent(inboxId);
    const jobId = extractJobIdFromInbox(decodedInboxId);
    await stopGenerating({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      jobId: jobId,
    });
  };

  const currentWorkflowRaw = createJobPlaygroundForm.watch('workflow');

  useEffect(() => {
    createWorkflowForm.setValue('workflowRaw', currentWorkflowRaw ?? '');
  }, [createWorkflowForm, currentWorkflowRaw]);

  return (
    <div className="h-full space-y-6 overflow-y-auto px-4 pb-4">
      <div className="flex items-center gap-3">
        <div className="flex w-full items-center justify-between pt-5">
          <span className="text-base font-medium text-white">Template</span>
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="h-7 w-7"
                  onClick={() => setIsTwoColumnLayout(!isTwoColumnLayout)}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  {isTwoColumnLayout ? (
                    <GalleryVertical className="text-gray-80 h-3.5 w-3.5" />
                  ) : (
                    <GalleryHorizontal className="text-gray-80 h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent>
                  <p>Switch Layout</p>
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>

            <Popover onOpenChange={setOpenWorkflowList} open={openWorkflowList}>
              <PopoverTrigger asChild>
                <Button
                  className="flex h-8 gap-1.5 rounded-lg"
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Use Template
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[250px] bg-gray-300 p-0 text-xs"
                side="bottom"
              >
                <Command className="text-gray-80 w-full rounded-lg border-0">
                  <CommandInput
                    className="text-xs placeholder:text-gray-100"
                    placeholder="Find a workflow..."
                  />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Examples">
                      {Object.keys(WORKFLOW_EXAMPLES).map((key) => (
                        <CommandItem
                          className="text-xs text-white"
                          key={key}
                          onSelect={() => {
                            handleWorkflowScriptChange(key);
                            setOpenWorkflowList(false);
                          }}
                        >
                          <span>{WORKFLOW_EXAMPLES?.[key]?.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />

                    <CommandGroup heading="Your Workflows">
                      {workflowList
                        ?.filter(
                          (workflow) =>
                            workflow.author !== '@@official.shinkai',
                        )
                        ?.map((workflow) => (
                          <CommandItem
                            className="text-xs text-white"
                            key={workflow.name}
                            onSelect={() => {
                              handleUseTemplate(workflow.tool_router_key);
                            }}
                          >
                            <span>{formatText(workflow.name)}</span>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Community">
                      {workflowList
                        ?.filter(
                          (workflow) =>
                            workflow.author === '@@official.shinkai',
                        )
                        ?.map((workflow) => (
                          <CommandItem
                            className="text-xs text-white"
                            key={workflow.name}
                            onSelect={() => {
                              handleUseTemplate(workflow.tool_router_key);
                            }}
                          >
                            <span>{formatText(workflow.name)}</span>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Dialog
              onOpenChange={setWorkflowDialogOpen}
              open={saveWorkflowDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  className="flex h-8 gap-1.5 rounded-lg"
                  disabled={!createWorkflowForm.watch('workflowRaw')}
                  size="sm"
                  type="button"
                >
                  <svg
                    className="h-4 w-4"
                    fill={'none'}
                    height={24}
                    viewBox="0 0 24 24"
                    width={24}
                  >
                    <path
                      d="M12 8V16M16 12L8 12"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                  Save
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg bg-gray-500">
                <Form {...createWorkflowForm}>
                  <form
                    className="space-y-8 overflow-y-auto pr-2"
                    onSubmit={createWorkflowForm.handleSubmit(
                      handleWorkflowSave,
                    )}
                  >
                    <DialogHeader>
                      <DialogTitle>Save Workflow</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-2.5">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-80 text-xs">Code</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoCircleIcon className="text-gray-80 h-3.5 w-3.5" />
                            </TooltipTrigger>
                            <TooltipPortal>
                              <TooltipContent>
                                <p>
                                  The name and version of the workflow is
                                  specified in the workflow code.
                                </p>
                              </TooltipContent>
                            </TooltipPortal>
                          </Tooltip>
                        </div>
                        <MarkdownPreview
                          className="h-[250px] overflow-auto"
                          source={`
\`\`\`
${createWorkflowForm.watch('workflowRaw')}
\`\`\`
                          `}
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-gray-80 text-xs">
                          Description
                        </span>
                        <FormField
                          control={createWorkflowForm.control}
                          name="workflowDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  className="placeholder-gray-80 !min-h-[100px] resize-none bg-gray-200 pl-2 pt-2 text-xs"
                                  onChange={field.onChange}
                                  placeholder={'Enter description...'}
                                  spellCheck={false}
                                  value={field.value}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <div className="flex gap-2 pt-4">
                        <DialogClose asChild className="flex-1">
                          <Button
                            className="min-w-[100px] flex-1"
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            {t('common.cancel')}
                          </Button>
                        </DialogClose>
                        <Button
                          className="min-w-[100px] flex-1"
                          disabled={isCreateWorkflowPending}
                          isLoading={isCreateWorkflowPending}
                          size="sm"
                          type="submit"
                        >
                          Save
                        </Button>
                      </div>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Form {...createJobPlaygroundForm}>
        <form
          className="space-y-3"
          onSubmit={createJobPlaygroundForm.handleSubmit(onSubmit)}
        >
          <div className="max-h-[71vh] space-y-5 overflow-y-auto pr-1">
            <div
              className={cn(
                'grid gap-3',
                isTwoColumnLayout ? 'grid-cols-2' : 'grid-cols-1',
              )}
            >
              <FormField
                control={createJobPlaygroundForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('chat.form.message')}</FormLabel>
                    <FormControl>
                      <Textarea
                        autoFocus={true}
                        className={cn(
                          'resize-vertical',
                          isTwoColumnLayout && '!max-h-full',
                        )}
                        spellCheck={false}
                        {...(isTwoColumnLayout && {
                          minHeight: 400,
                          maxHeight: 400,
                        })}
                        onKeyDown={(event) => {
                          if (
                            event.key === 'Enter' &&
                            (event.metaKey || event.ctrlKey)
                          ) {
                            createJobPlaygroundForm.handleSubmit(onSubmit)();
                          }
                        }}
                        placeholder={t('chat.form.messagePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createJobPlaygroundForm.control}
                name="workflow"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Workflow</FormLabel>
                    <FormControl>
                      <Textarea
                        autoFocus={true}
                        className="resize-vertical"
                        onKeyDown={handleWorkflowKeyDown}
                        placeholder="Workflow"
                        spellCheck={false}
                        {...(isTwoColumnLayout
                          ? {
                              minHeight: 400,
                              maxHeight: 400,
                            }
                          : {
                              minHeight: 280,
                              maxHeight: 280,
                            })}
                        {...field}
                      />
                    </FormControl>
                    {Array.from(workflowHistory).length > 0 && (
                      <>
                        <div className="absolute right-3 top-3 flex items-center gap-2">
                          <Button
                            className="h-6 w-6"
                            disabled={currentWorkflowIndex <= 0}
                            onClick={() => {
                              if (currentWorkflowIndex > 0) {
                                setCurrentWorkflowIndex(
                                  (prevIndex) => prevIndex - 1,
                                );
                                createJobPlaygroundForm.setValue(
                                  'workflow',
                                  Array.from(workflowHistory)[
                                    currentWorkflowIndex - 1
                                  ],
                                );
                              }
                            }}
                            size="icon"
                            type="button"
                            variant="outline"
                          >
                            <MoveLeft className="h-3 w-3" />
                          </Button>

                          <Button
                            className="h-6 w-6"
                            disabled={
                              currentWorkflowIndex >= workflowHistory.size - 1
                            }
                            onClick={() => {
                              if (
                                currentWorkflowIndex <
                                workflowHistory.size - 1
                              ) {
                                setCurrentWorkflowIndex(
                                  (prevIndex) => prevIndex + 1,
                                );
                                createJobPlaygroundForm.setValue(
                                  'workflow',
                                  Array.from(workflowHistory)[
                                    currentWorkflowIndex + 1
                                  ],
                                );
                              }
                            }}
                            size="icon"
                            type="button"
                            variant="outline"
                          >
                            <MoveRight className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <Button
                            className="h-6 w-6"
                            onClick={() => {
                              setCurrentWorkflowIndex(-1);
                              createJobPlaygroundForm.setValue('workflow', '');
                              clearWorkflowHistory();
                            }}
                            size="icon"
                            type="button"
                            variant="outline"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={createJobPlaygroundForm.control}
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

            <Collapsible>
              <CollapsibleTrigger className="hover:bg-gray-350 flex w-full items-center justify-between gap-2 rounded-lg bg-gray-400 p-2.5 [&[data-state=open]>svg]:rotate-90">
                <p className="text-xs text-gray-50">Set Chat Context</p>
                <ChevronRightIcon className="h-4 w-4 transition" />
              </CollapsibleTrigger>
              <CollapsibleContent>
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

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className="flex h-10 w-10 items-center justify-center gap-2 rounded-lg p-2.5 text-left hover:bg-gray-500"
                          onClick={() => setKnowledgeSearchOpen(true)}
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
                  </div>

                  <div className="mt-2 flex flex-col gap-1.5">
                    <Button
                      className="hover:bg-gray-350 flex h-[40px] items-center justify-between gap-2 rounded-lg p-2.5 text-left"
                      onClick={() => setSetJobScopeOpen(true)}
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
                      control={createJobPlaygroundForm.control}
                      name="files"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="sr-only">
                            Upload a file
                          </FormLabel>
                          <FormControl>
                            <FileUploader
                              accept={allowedFileExtensions.join(',')}
                              allowMultiple
                              descriptionText={allowedFileExtensions?.join(
                                ' | ',
                              )}
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
              </CollapsibleContent>
            </Collapsible>
          </div>
          {isLoadingMessage ? (
            <Button
              className="ml-auto flex h-8 w-auto min-w-[100px] gap-1.5 rounded-lg font-semibold"
              onClick={onStopGenerating}
              size="sm"
              type="button"
            >
              <StopIcon className="h-4 w-4" />
              Stop
            </Button>
          ) : (
            <Button
              className="ml-auto flex h-8 w-auto min-w-[100px] gap-1.5 rounded-lg font-semibold"
              disabled={isPending}
              size="sm"
              type="submit"
            >
              <CirclePlayIcon className="h-4 w-4" />
              Run
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
}

export default WorkflowEditor;
