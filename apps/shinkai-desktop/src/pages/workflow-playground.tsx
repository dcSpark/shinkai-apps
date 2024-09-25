import { zodResolver } from '@hookform/resolvers/zod';
import { DialogClose } from '@radix-ui/react-dialog';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { getTool } from '@shinkai_network/shinkai-message-ts/api/tools/index';
import { ShinkaiTool } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils';
import {
  CreateJobFormSchema,
  createJobFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/create-job';
import { DEFAULT_CHAT_CONFIG } from '@shinkai_network/shinkai-node-state/v2/constants';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob';
import { useCreateWorkflow } from '@shinkai_network/shinkai-node-state/v2/mutations/createWorkflow/useCreateWorkflow';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/useGetChatConversationWithPagination';
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
  DialogDescription,
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
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
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
} from '@shinkai_network/shinkai-ui/assets';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookText,
  CirclePlayIcon,
  GalleryHorizontal,
  GalleryVertical,
  Loader2,
  MoveLeft,
  MoveRight,
  PlusIcon,
  TrashIcon,
} from 'lucide-react';
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useSetJobScope } from '../components/chat/context/set-job-scope-context';
import { isWorkflowShinkaiTool } from '../components/tools/tool-details';
import { allowedFileExtensions } from '../lib/constants';
import { useAnalytics } from '../lib/posthog-provider';
import { ADD_AGENT_PATH } from '../routes/name';
import { useAuth } from '../store/auth';
import { useExperimental } from '../store/experimental';
import { useSettings } from '../store/settings';

const WorkflowPlayground = () => {
  return (
    <Tabs className="h-full" defaultValue="workflow">
      <div className="mx-auto flex h-full flex-col pb-4 pt-6">
        <div className="flex justify-between gap-4 border-b border-gray-300 px-5">
          <div className="flex items-center gap-8 pb-5">
            <h1 className="text-2xl font-semibold tracking-tight">
              Playground
            </h1>
            <TabsList className="grid w-full grid-cols-2 rounded-lg border border-gray-400 bg-transparent p-0.5">
              <TabsTrigger
                className="flex h-8 items-center gap-1.5 text-xs font-semibold"
                value="workflow"
              >
                Workflow
              </TabsTrigger>
              <TabsTrigger
                className="flex h-8 items-center gap-1.5 text-xs font-semibold"
                value="baml"
              >
                BAML
              </TabsTrigger>
            </TabsList>
          </div>
          <div>
            {/*<button>Get Started with Template</button>*/}
            <DocsPanel />
          </div>
        </div>
        <div className="flex flex-1">
          <div className="max-w-[60%] flex-1 shrink-0 basis-[60%] border-r border-gray-300 px-5 pt-5">
            <TabsContent className="h-full" value="workflow">
              <WorkflowEditor />
            </TabsContent>
            <TabsContent className="h-full" value="baml">
              <BamlEditor />
            </TabsContent>
          </div>
          <div className="h-full flex-1 flex-col px-5 pt-5">
            <Outlet />
          </div>
        </div>
      </div>
    </Tabs>
  );
};
export default WorkflowPlayground;

function DocsPanel() {
  return (
    <Sheet modal={false}>
      <SheetTrigger asChild>
        <Button className="h-8 gap-1.5 rounded-lg" size="sm" variant="outline">
          <BookText className="h-4 w-4" />
          Docs
        </Button>
      </SheetTrigger>
      <SheetContent
        className="max-w-md"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <SheetHeader className="mb-3">
          <SheetTitle className="flex h-[40px] items-center gap-4">
            Documentation
          </SheetTitle>
          <p className="text-gray-80 text-sm">
            Learn more about [] and how to use them.
          </p>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-200px)] flex-1">
          {/*// content*/}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function WorkflowEditor() {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const workflowHistory = useExperimental((state) => state.workflowHistory);
  const addWorkflowHistory = useExperimental(
    (state) => state.addWorkflowHistory,
  );

  const [workflowDescription, setWorkflowDescription] = useState('');
  const [saveWorkflowDialogOpen, setWorkflowDialogOpen] = useState(false);

  const clearWorkflowHistory = useExperimental(
    (state) => state.clearWorkflowHistory,
  );
  const defaulAgentId = useSettings((state) => state.defaultAgentId);
  const navigate = useNavigate();

  const { data: workflowList } = useGetWorkflowList({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

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

  // **Create the main job form**
  const createJobForm = useForm<CreateJobFormSchema>({
    resolver: zodResolver(createJobFormSchema),
    defaultValues: {
      files: [],
    },
  });

  const { llmProviders, isSuccess } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  useEffect(() => {
    if (isSuccess && llmProviders?.length && !defaulAgentId) {
      createJobForm.setValue('agent', llmProviders[0].id);
    } else {
      createJobForm.setValue('agent', defaulAgentId);
    }
  }, [llmProviders, createJobForm, defaulAgentId, isSuccess]);

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
      createJobForm.setValue('workflow', value);
    },
    [createJobForm],
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

  const [selectedWorkflowScript, setSelectedWorkflowScript] = useState<
    'custom' | 'example1' | 'example2'
  >('custom');
  const [workflowFormData, setWorkflowFormData] = useState<{
    custom: any;
    example1: any;
    example2: any;
  }>({
    custom: {
      message: '',
      workflow: '',
      agent: '',
    },
    example1: {
      message: 'Example message 1',
      workflow: `workflow Extensive_summary v0.1 {
    step Initialize {
        $PROMPT = "Summarize this: "
        $EMBEDDINGS = call process_embeddings_in_job_scope()
    }
    step Summarize {
        $RESULT = call multi_inference($PROMPT, $EMBEDDINGS)
    }
} @@official.shinkai`,
      agent: '',
    },
    example2: {
      message: 'Example message 2',
      workflow: 'Example workflow 2',
      agent: '',
    },
  });

  const handleWorkflowScriptChange = (
    script: 'custom' | 'example1' | 'example2',
  ) => {
    const currentValues = createJobForm.getValues();

    // Save current form data
    setWorkflowFormData((prevData) => {
      const updatedData = {
        ...prevData,
        [selectedWorkflowScript]: {
          message: currentValues.message || '',
          workflow: currentValues.workflow || '',
          agent: currentValues.agent || '',
          files: currentValues.files || [],
        },
      };
      return updatedData;
    });

    // Switch to the selected script
    setSelectedWorkflowScript(script);

    // Load the new form data
    createJobForm.reset(workflowFormData[script]);
  };

  useEffect(() => {
    setWorkflowFormData((prevData) => ({
      ...prevData,
      [selectedWorkflowScript]: createJobForm.getValues(),
    }));
  }, [createJobForm, selectedWorkflowScript]);

  const handleWorkflowSave = async () => {
    await createWorkflow({
      token: auth?.api_v2_key ?? '',
      nodeAddress: auth?.node_address ?? '',
      raw: createJobForm.getValues().workflow ?? '',
      description: workflowDescription,
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
      createJobForm.setValue('workflow', tool.workflow.raw);
      setOpenWorkflowList(false);
    }
  };

  return (
    <Fragment>
      <div className="mb-7 flex items-center justify-end gap-2.5">
        <div className="flex w-full items-center justify-between">
          <span className="text-base font-medium text-white">Template</span>
          <div className="flex items-center gap-3">
            <TooltipProvider delayDuration={0}>
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
            </TooltipProvider>

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
                      <CommandItem
                        className="text-xs text-white"
                        key="example1"
                        onSelect={() => {
                          handleWorkflowScriptChange('example1');
                          setOpenWorkflowList(false);
                        }}
                      >
                        <span>Full Document Summarizer</span>
                      </CommandItem>
                      <CommandItem
                        className="text-xs text-white"
                        key="example2"
                        onSelect={() => {
                          handleWorkflowScriptChange('example2');
                          setOpenWorkflowList(false);
                        }}
                      >
                        <span>example2</span>
                      </CommandItem>
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
                  disabled={createJobForm.watch('workflow') === ''}
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
              <DialogContent className="max-w-md bg-gray-500">
                <DialogHeader>
                  <DialogTitle>Save as Workflow</DialogTitle>
                  <DialogDescription>
                    Add a description to save this workflow.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                  <Textarea
                    className="placeholder-gray-80 !min-h-[100px] resize-none bg-gray-200 pl-2 pt-2 text-xs"
                    onChange={(e) => {
                      setWorkflowDescription(e.target.value);
                    }}
                    placeholder={'Enter description...'}
                    spellCheck={false}
                    value={workflowDescription}
                  />
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
                      onClick={handleWorkflowSave}
                      size="sm"
                    >
                      Save
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Form {...createJobForm}>
        <form
          className="space-y-8 overflow-y-auto pr-2"
          onSubmit={createJobForm.handleSubmit(onSubmit)}
        >
          <div className="space-y-4">
            <div
              className={cn(
                'grid gap-3',
                isTwoColumnLayout ? 'grid-cols-2' : 'grid-cols-1',
              )}
            >
              <FormField
                control={createJobForm.control}
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
                        {...(isTwoColumnLayout && {
                          minHeight: 400,
                          maxHeight: 400,
                        })}
                        onKeyDown={(event) => {
                          if (
                            event.key === 'Enter' &&
                            (event.metaKey || event.ctrlKey)
                          ) {
                            createJobForm.handleSubmit(onSubmit)();
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
                control={createJobForm.control}
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
                                createJobForm.setValue(
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
                                createJobForm.setValue(
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
                              createJobForm.setValue('workflow', '');
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
                    <TooltipProvider delayDuration={0}>
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
                    </TooltipProvider>
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
                      control={createJobForm.control}
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
          <Button
            className="ml-auto flex h-8 w-auto min-w-[100px] gap-1.5 rounded-lg font-semibold"
            disabled={isPending}
            isLoading={isPending}
            size="sm"
            type="submit"
          >
            <CirclePlayIcon className="h-4 w-4" />
            Run
          </Button>
        </form>
      </Form>
    </Fragment>
  );
}

const escapeContent = (content: string) => {
  return content.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
};

function BamlEditor() {
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const defaulAgentId = useSettings((state) => state.defaultAgentId);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [workflowDescription, setWorkflowDescription] = useState('');

  const { isPending, mutateAsync: createJob } = useCreateJob({
    onSuccess: (data) => {
      navigate(
        `/workflow-playground/${encodeURIComponent(buildInboxIdFromJobId(data.jobId))}`,
      );
    },
  });

  const { mutateAsync: createWorkflow, isPending: isCreateWorkflowPending } =
    useCreateWorkflow({
      onSuccess: () => {
        toast.success('BAML saved successfully');
        setWorkflowDialogOpen(false);
      },
      onError: (error) => {
        toast.error('Failed to save BAML', {
          description: error?.response?.data?.message ?? error.message,
        });
      },
    });

  const { data: workflowList } = useGetWorkflowList({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const [openWorkflowList, setOpenWorkflowList] = useState(false);

  const [isTwoColumnLayout, setIsTwoColumnLayout] = useState(true);
  const [selectedBamlScript, setSelectedBamlScript] = useState<
    'my' | 'extractResume' | 'classifyMessage' | 'ragWithCitations'
  >('my');

  const [bamlFormData, setBamlFormData] = useState<{
    my: any;
    extractResume: any;
    classifyMessage: any;
    ragWithCitations: any;
  }>({
    my: {
      bamlInput: '',
      dslFile: '',
      functionName: '',
      paramName: '',
    },
    extractResume: {
      bamlInput: `John Doe
Education
- University of California, Berkeley
  - B.S. in Computer Science
  - 2020
Skills
- Python
- Java
- C++`,
      dslFile: `class Resume {
  name string
  education Education[] @description("Extract in the same order listed")
  skills string[] @description("Only include programming languages")
}

class Education {
  school string
  degree string
  year int
}

function ExtractResume(resume_text: string) -> Resume {
  client ShinkaiProvider

  // The prompt uses Jinja syntax. Change the models or this text and watch the prompt preview change!
  prompt #"
    Parse the following resume and return a structured representation of the data in the schema below.

    Resume:
    ---
    {{ resume_text }}
    ---

    {# special macro to print the output instructions. #}
    {{ ctx.output_format }}

    JSON:
  "#
}`,
      functionName: 'ExtractResume',
      paramName: 'resume_text',
    },
    classifyMessage: {
      bamlInput: `I can't access my account using my login credentials. I havent received the promised reset password email. Please help.`,
      dslFile: `class Message {
  text string
  category string
}

function ClassifyMessage(message_text: string) -> Message {
  client ShinkaiProvider

  prompt #"
    Classify the following message into appropriate categories.

    Message:
    ---
    {{ message_text }}
    ---

    JSON:
  "#
}`,
      functionName: 'ClassifyMessage',
      paramName: 'message_text',
    },
    ragWithCitations: {
      bamlInput: `{
        "documents": [
          {
            "title": "OmniParser Abstract",
            "link": "https://arxiv.org",
            "text": "- OmniParser for Pure Vision Based GUI Agent Yadong Lu 1 , Jianwei Yang 1 , Yelong Shen 2 , Ahmed Awadallah 1  1 Microsoft Research 2 Microsoft Gen AI {yadonglu, jianwei.yang, yeshe, ahmed.awadallah}@microsoft.com Abstract  (Source: 2408.00203v1.pdf, Section: )"
          },
          {
            "title": "OmniParser Page 1",
            "link": "https://arxiv.org",
            "text": "- Yadong Lu 1 , Jianwei Yang 1 , Yelong Shen 2 , Ahmed Awadallah 1 (Source: 2408.00203v1.pdf, Page: [1]) - its usage to web browsing tasks. We aim to build a general approach that works on a variety of platforms and applications. (Source: 2408.00203v1.pdf, Page: [2]) - In this work, we argue that previous pure vision-based screen parsing techniques are not satisfactory, which lead to significant underestimation of GPT-4V model's understanding capabilities. And a reliable vision-based screen parsing method that works well on general user interface is a key to improve the robustness of the agentic workflow on various operating systems and (Source: 2408.00203v1.pdf, Page: [2])"
          },
          {
            "title": "OmniParser Page 2",
            "link": "https://arxiv.org",
            "text": "- applications. We present OMNIPARSER, a general screen parsing tool to extract information from UI screenshot into structured bounding box and labels which enhances GPT-4V's performance in action prediction in a variety of user tasks. (Source: 2408.00203v1.pdf, Page: [2]) - We list our contributions as follows: (Source: 2408.00203v1.pdf, Page: [2]) - • We curate a interactable region detection dataset using bounding boxes extracted from DOM tree of popular webpages. (Source: 2408.00203v1.pdf, Page: [2]) - • We propose OmniParser, a pure vision-based user interface screen parsing method that combines multiple finetuned models for better screen understanding and easier grounded action generation. (Source: 2408.00203v1.pdf, Page: [2]) - • We evaluate our approach on ScreenSpot, Mind2Web and AITW benchmark, and demonstrated a significant improvement from the original GPT-4V baseline without requiring additional input other than screenshot. (Source: 2408.00203v1.pdf, Page: [2])"
          },
          {
            "title": "OmniParser Acknowledgement",
            "link": "https://arxiv.org",
            "text": "- Acknowledgement (Source: 2408.00203v1.pdf, Page: [9]) - We would like to thank Corby Rosset and authors of ClueWeb22 for providing the seed urls for which we use to collect data to finetune the interactable region detection model. The data collection pipeline adapted AutoGen's multimodal websurfer code for extracting interatable elements in DOM, for which we thank Adam Fourney. We also thank Dillon DuPont for providing the (Source: 2408.00203v1.pdf, Page: [9]) - processed version of mind2web benchmark. (Source: 2408.00203v1.pdf, Page: [9])"
          },
          {
            "title": "OmniParser References",
            "link": "https://arxiv.org",
            "text": "- References (Source: 2408.00203v1.pdf, Page: [9]) - [BEH + 23] Rohan Bavishi, Erich Elsen, Curtis Hawthorne, Maxwell Nye, Augustus Odena, Arushi Somani, and Sa ˘ gnak Ta¸sırlar. Introducing our multimodal models, 2023. (Source: 2408.00203v1.pdf, Page: [9]) - [BZX + 21] Chongyang Bai, Xiaoxue Zang, Ying Xu, Srinivas Sunkara, Abhinav Rastogi, Jindong Chen, and Blaise Aguera y Arcas. Uibert: Learning generic multimodal representations for ui understanding, 2021. (Source: 2408.00203v1.pdf, Page: [9]) - [CSC + 24] Kanzhi Cheng, Qiushi Sun, Yougang Chu, Fangzhi Xu, Yantao Li, Jianbing Zhang, and Zhiyong Wu. Seeclick: Harnessing gui grounding for advanced visual gui agents, 2024. (Source: 2408.00203v1.pdf, Page: [9])"
          }
        ]
      }`,
      dslFile: `class Citation {
        number int @description(#"
          the index in this array
        "#)
        documentTitle string
        sourceLink string
        relevantTextFromDocument string @alias("relevantSentenceFromDocument") @description(#"
          The relevant text from the document that supports the answer. This is a citation. You must quote it EXACTLY as it appears in the document with any special characters it contains. The text should be contiguous and not broken up. You may NOT summarize or skip sentences. If you need to skip a sentence, start a new citation instead.
        "#)
      }

      class Answer {
        answersInText Citation[] @alias("relevantSentencesFromText")
        answer string @description(#"
          An answer to the user's question that MUST cite sources from the relevantSentencesFromText. Like [0]. If multiple citations are needed, write them like [0][1][2].
        "#)
      }

      class Document {
        title string
        text string
        link string
      }
      class Context {
        documents Document[]
      }

      function AnswerQuestion(context: Context) -> Answer {
        client ShinkaiProvider
        prompt #"
          Answer the following question using the given context below. Make it extensive and detailed.
          CONTEXT:
          {% for document in context.documents %}
          ----
          DOCUMENT TITLE: {{  document.title }}
          {{ document.text }}
          DOCUMENT LINK: {{ document.link }}
          ----
          {% endfor %}

          {{ ctx.output_format }}

          {{ _.role("user") }}
          QUESTION: Summarize this in detail.

          ANSWER:
        "#
      }`,
      functionName: 'AnswerQuestion',
      paramName: 'context',
    },
  });

  const handleUseTemplate = async (toolRouterKey: string) => {
    if (!auth) return;
    const workflowInfo = await getTool(
      auth?.node_address,
      auth?.api_v2_key,
      toolRouterKey,
    );
    // @ts-expect-error: for now
    const tool = workflowInfo.content?.[0] as ShinkaiTool;
    // TODO:
    // if (isWorkflowShinkaiTool(tool)) {
    //   createJobForm.setValue('workflow', tool.workflow.raw);
    //   setOpenWorkflowList(false);
    // }
  };

  const bamlForm = useForm({
    defaultValues: bamlFormData[selectedBamlScript],
  });

  const handleBamlScriptChange = (
    script: 'my' | 'extractResume' | 'classifyMessage' | 'ragWithCitations',
  ) => {
    // Save current form data
    setBamlFormData((prevData) => ({
      ...prevData,
      [selectedBamlScript]: bamlForm.getValues(),
    }));

    // Switch to the selected script
    setSelectedBamlScript(script);

    // Load the new form data
    bamlForm.reset(bamlFormData[script]);
  };

  const handleBamlSave = async () => {
    if (!auth) return;

    const bamlData = bamlFormData[selectedBamlScript];
    const { dslFile, functionName, paramName, bamlScriptName = '' } = bamlData;
    console.log('bamlData:', bamlData);

    if (!defaulAgentId) {
      toast.error('Please select an AI provider.');
      return;
    }
    if (!bamlScriptName.trim()) {
      toast.error('Please provide a name for the BAML script.');
      return;
    }

    if (!dslFile.trim()) {
      toast.error('Please provide a DSL file for the BAML script.');
      return;
    }
    if (!functionName.trim()) {
      toast.error('Please provide a function name for the BAML script.');
      return;
    }

    if (!paramName.trim()) {
      toast.error('Please provide a parameter name for the BAML script.');
      return;
    }

    const escapedDslFile = escapeContent(dslFile);
    const workflowRaw = `
      workflow ${bamlScriptName} v0.1 {
        step Initialize {
          $DSL = "${escapedDslFile}"
          $PARAM = "${paramName}"
          $FUNCTION = "${functionName}"
          $RESULT = call baml_inference($INPUT, "", "", $DSL, $FUNCTION, $PARAM)
        }
      } @@localhost.arb-sep-shinkai
    `;
    const workflowDescription = `Workflow for ${bamlScriptName}`;
    await createWorkflow({
      token: auth?.api_v2_key ?? '',
      nodeAddress: auth?.node_address ?? '',
      raw: workflowRaw,
      description: workflowDescription,
    });
  };

  useEffect(() => {
    setBamlFormData((prevData) => ({
      ...prevData,
      [selectedBamlScript]: bamlForm.getValues(),
    }));
  }, [bamlForm, selectedBamlScript]);

  const onBamlSubmit = async (data: any) => {
    const { bamlInput, dslFile, functionName, paramName } = data;
    const escapedBamlInput = escapeContent(bamlInput);
    const escapedDslFile = escapeContent(dslFile);
    const workflowText = `
    workflow ${functionName} v0.1 {
      step Initialize {
        $DSL = "${escapedDslFile}"
        $INPUT = "${escapedBamlInput}"
        $PARAM = "${paramName}"
        $FUNCTION = "${functionName}"
        $RESULT = call baml_inference($INPUT, "", "", $DSL, $FUNCTION, $PARAM)
      }
    } @@localhost.arb-sep-shinkai
  `;

    if (!auth) return;

    await createJob({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      llmProvider: defaulAgentId,
      content: escapedBamlInput,
      files: [],
      workflowCode: workflowText,
      isHidden: true,
      selectedVRFiles: [],
      selectedVRFolders: [],
      chatConfig: {
        stream: false,
        custom_prompt: '',
        temperature: DEFAULT_CHAT_CONFIG.temperature,
        top_p: DEFAULT_CHAT_CONFIG.top_p,
        top_k: DEFAULT_CHAT_CONFIG.top_k,
      },
    });

    // Save the form data after submission
    setBamlFormData((prevData) => ({
      ...prevData,
      [selectedBamlScript]: data,
    }));
  };

  return (
    <div className="max-h-[calc(100vh_-_200px)] space-y-8 overflow-y-auto pr-2">
      <div className="flex items-center gap-3">
        <div className="flex w-full items-center justify-between">
          <span className="text-base font-medium text-white">
            BAML Template
          </span>
          <div className="flex items-center gap-3">
            <TooltipProvider delayDuration={0}>
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
            </TooltipProvider>
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
                      <CommandItem
                        className="text-xs text-white"
                        key="extractResume"
                        onSelect={() => {
                          handleBamlScriptChange('extractResume');
                          setOpenWorkflowList(false);
                        }}
                      >
                        <span>Extract Resume</span>
                      </CommandItem>
                      <CommandItem
                        className="text-xs text-white"
                        key="classifyMessage"
                        onSelect={() => {
                          handleBamlScriptChange('classifyMessage');
                          setOpenWorkflowList(false);
                        }}
                      >
                        <span> Classify Message</span>
                      </CommandItem>
                      <CommandItem
                        className="text-xs text-white"
                        key="ragWithCitations"
                        onSelect={() => {
                          handleBamlScriptChange('ragWithCitations');
                          setOpenWorkflowList(false);
                        }}
                      >
                        <span> RAG with Citations</span>
                      </CommandItem>
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
          </div>
        </div>

        <Dialog onOpenChange={setWorkflowDialogOpen} open={workflowDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="flex h-8 gap-1.5 rounded-lg"
              // disabled={createJobForm.watch('workflow') === ''}
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
          <DialogContent className="max-w-md bg-gray-500">
            <DialogHeader>
              <DialogTitle>Save as Workflow</DialogTitle>
              <DialogDescription>
                Add a description to save this workflow.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <Textarea
                className="placeholder-gray-80 !min-h-[100px] resize-none bg-gray-200 pl-2 pt-2 text-xs"
                onChange={(e) => {
                  setWorkflowDescription(e.target.value);
                }}
                placeholder={'Enter description...'}
                spellCheck={false}
                value={workflowDescription}
              />
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
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  className="min-w-[100px] flex-1"
                  disabled={isCreateWorkflowPending}
                  isLoading={isCreateWorkflowPending}
                  onClick={handleBamlSave}
                  size="sm"
                >
                  Save
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Form {...bamlForm}>
        <form
          className="space-y-8 pt-2"
          onSubmit={bamlForm.handleSubmit(onBamlSubmit)}
        >
          <FormField
            control={bamlForm.control}
            name="bamlScriptName"
            render={({ field }) => (
              <TextField field={field} label="Name the BAML Script" />
            )}
          />

          {isTwoColumnLayout ? (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={bamlForm.control}
                name="bamlInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BAML Input</FormLabel>
                    <FormControl>
                      <Textarea
                        maxHeight={600}
                        minHeight={500}
                        placeholder="Enter BAML input"
                        resize="vertical"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bamlForm.control}
                name="dslFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DSL File</FormLabel>
                    <FormControl>
                      <Textarea
                        maxHeight={600}
                        minHeight={500}
                        placeholder="Enter DSL file content"
                        resize="vertical"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <>
              <FormField
                control={bamlForm.control}
                name="bamlInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BAML Input</FormLabel>
                    <FormControl>
                      <Textarea
                        className="resize-vertical"
                        placeholder="Enter BAML input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bamlForm.control}
                name="dslFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DSL File</FormLabel>
                    <FormControl>
                      <Textarea
                        className="resize-vertical"
                        placeholder="Enter DSL file content"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={bamlForm.control}
              name="functionName"
              render={({ field }) => (
                <TextField field={field} label="Enter function name" />
              )}
            />
            <FormField
              control={bamlForm.control}
              name="paramName"
              render={({ field }) => (
                <TextField field={field} label="Enter param name" />
              )}
            />
          </div>
          <Button
            className="ml-auto flex h-8 w-auto min-w-[100px] gap-1.5 rounded-lg font-semibold"
            disabled={isPending}
            isLoading={isPending}
            size="sm"
            type="submit"
          >
            <CirclePlayIcon className="h-4 w-4" />
            Run
          </Button>
        </form>
      </Form>
    </div>
  );
}

export function PlaygroundPreview() {
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);
  const auth = useAuth((state) => state.auth);

  const { data } = useGetChatConversationWithPagination({
    token: auth?.api_v2_key ?? '',
    nodeAddress: auth?.node_address ?? '',
    inboxId: inboxId as string,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    refetchIntervalEnabled: true,
    enabled: !!inboxId,
  });

  const isLoadingMessage = useMemo(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    return inboxId && lastMessage?.isLocal;
  }, [data?.pages, inboxId]);

  return (
    <div className="flex max-h-screen w-full flex-1 flex-col overflow-hidden">
      {!inboxId && (
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-80 text-sm">
            Run a workflow/baml to see the output here.
          </p>
        </div>
      )}
      {isLoadingMessage && (
        <div className="flex h-full items-center justify-center">
          <Loader2 className={cn('h-4 w-4 animate-spin')} />{' '}
        </div>
      )}
      <AnimatePresence>
        {!isLoadingMessage && (
          <motion.div
            animate={{ opacity: 1 }}
            className="mt-4 overflow-hidden rounded-md border border-gray-400"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <p className="text-gray-80 border-b border-gray-300 bg-gray-200 px-2.5 py-2 text-xs">
              Output
            </p>
            <div className="p-4">
              <MarkdownPreview
                className="prose-h1:!text-gray-80 prose-h1:!text-xs !text-gray-80 !text-xs"
                source={data?.pages?.at(-1)?.at(-1)?.content ?? ''}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
