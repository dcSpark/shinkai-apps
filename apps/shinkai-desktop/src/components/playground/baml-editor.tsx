import { zodResolver } from '@hookform/resolvers/zod';
import { DialogClose } from '@radix-ui/react-dialog';
import { StopIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { getTool } from '@shinkai_network/shinkai-message-ts/api/tools/index';
import { ShinkaiTool } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import {
  buildInboxIdFromJobId,
  extractJobIdFromInbox,
} from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { DEFAULT_CHAT_CONFIG } from '@shinkai_network/shinkai-node-state/v2/constants';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob';
import { useCreateWorkflow } from '@shinkai_network/shinkai-node-state/v2/mutations/createWorkflow/useCreateWorkflow';
import { useStopGeneratingLLM } from '@shinkai_network/shinkai-node-state/v2/mutations/stopGeneratingLLM/useStopGeneratingLLM';
import { useGetWorkflowList } from '@shinkai_network/shinkai-node-state/v2/queries/getWorkflowList/useGetWorkflowList';
import {
  Button,
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
  Textarea,
  TextField,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import {
  CirclePlayIcon,
  GalleryHorizontal,
  GalleryVertical,
} from 'lucide-react';
import { InfoCircleIcon } from 'primereact/icons/infocircle';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  CreateWorkflowFormSchema,
  createWorkflowFormSchema,
  useStopGenerationPlayground,
} from '../../pages/workflow-playground';
import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';
import { isWorkflowShinkaiTool } from '../tools/tool-details';
import { BAML_EXAMPLES } from './constants';

const escapeContent = (content: string) => {
  return content.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
};

const bamlFormSchema = z.object({
  bamlInput: z.string().min(1),
  dslFile: z.string().min(1),
  functionName: z.string().min(1),
  paramName: z.string().min(1),
  bamlScriptName: z.string().min(1),
});

type BamlFormSchema = z.infer<typeof bamlFormSchema>;

function BamlEditor() {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const defaulAgentId = useSettings((state) => state.defaultAgentId);
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);

  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const { mutateAsync: stopGenerating } = useStopGeneratingLLM();

  const createWorkflowForm = useForm<CreateWorkflowFormSchema>({
    resolver: zodResolver(createWorkflowFormSchema),
  });

  const { mutateAsync: createJob } = useCreateJob({
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

  const { isLoadingMessage } = useStopGenerationPlayground();

  const { data: workflowList } = useGetWorkflowList(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
    },
    {
      select: (data) =>
        data.filter((workflow) => workflow.name.includes('baml_')),
    },
  );

  const [openWorkflowList, setOpenWorkflowList] = useState(false);

  const [isTwoColumnLayout, setIsTwoColumnLayout] = useState(true);

  const handleUseTemplate = async (toolRouterKey: string) => {
    if (!auth) return;
    const workflowInfo = await getTool(
      auth?.node_address,
      auth?.api_v2_key,
      toolRouterKey,
    );
    const tool = workflowInfo.content?.[0] as ShinkaiTool;

    if (isWorkflowShinkaiTool(tool)) {
      console.log(tool.workflow.steps, 'tool.workflow.steps');
      // @ts-expect-error types
      const workflowSteps = tool.workflow.steps?.[0]?.body?.[0]?.value;
      const dslFile = workflowSteps?.find(
        // @ts-expect-error types
        (step) => step.value.register === '$DSL',
      )?.value?.value;
      const bamlInput = workflowSteps?.find(
        // @ts-expect-error types
        (step) => step.value.register === '$INPUT',
      )?.value?.value;
      const paramName = workflowSteps?.find(
        // @ts-expect-error types
        (step) => step.value.register === '$PARAM',
      )?.value?.value;
      const functionName = workflowSteps?.find(
        // @ts-expect-error types
        (step) => step.value.register === '$FUNCTION',
      )?.value?.value;

      bamlForm.setValue('dslFile', dslFile);
      bamlForm.setValue('bamlInput', bamlInput);
      bamlForm.setValue('paramName', paramName);
      bamlForm.setValue('functionName', functionName);
      bamlForm.setValue('bamlScriptName', tool.workflow.name);
      setOpenWorkflowList(false);
    }
  };

  const bamlForm = useForm<BamlFormSchema>({
    resolver: zodResolver(bamlFormSchema),
    defaultValues: {
      bamlInput: '',
      dslFile: '',
      functionName: '',
      paramName: '',
      bamlScriptName: '',
    },
  });

  const handleBamlScriptChange = (script: string) => {
    bamlForm.setValue('dslFile', BAML_EXAMPLES[script].dslFile);
    bamlForm.setValue('functionName', BAML_EXAMPLES[script].functionName);
    bamlForm.setValue('paramName', BAML_EXAMPLES[script].paramName);
    bamlForm.setValue('bamlScriptName', BAML_EXAMPLES[script].name);
    bamlForm.setValue('bamlInput', BAML_EXAMPLES[script].bamlInput);
  };

  const currentBamlScriptName = bamlForm.watch('bamlScriptName');
  const currentBamlInput = bamlForm.watch('bamlInput');
  const currentDslFile = bamlForm.watch('dslFile');
  const currentFunctionName = bamlForm.watch('functionName');
  const currentParamName = bamlForm.watch('paramName');

  useEffect(() => {
    const escapedBamlInput = escapeContent(currentBamlInput);
    const escapedDslFile = escapeContent(currentDslFile);
    const workflowRaw = getWorkflowFromBaml(
      currentBamlScriptName,
      escapedDslFile,
      escapedBamlInput,
      currentParamName,
      currentFunctionName,
    );
    createWorkflowForm.setValue('workflowRaw', workflowRaw);
  }, [
    currentBamlScriptName,
    currentBamlInput,
    currentDslFile,
    currentFunctionName,
    currentParamName,
    createWorkflowForm,
  ]);

  const onBamlSubmit = async (data: BamlFormSchema) => {
    const { bamlInput, dslFile, functionName, paramName, bamlScriptName } =
      data;
    const escapedBamlInput = escapeContent(bamlInput);
    const escapedDslFile = escapeContent(dslFile);
    const workflowCode = getWorkflowFromBaml(
      bamlScriptName,
      escapedDslFile,
      escapedBamlInput,
      paramName,
      functionName,
    );

    if (!auth) return;

    await createJob({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      llmProvider: defaulAgentId,
      content: escapedBamlInput,
      workflowCode,
      isHidden: true,
      chatConfig: {
        stream: false,
        custom_prompt: '',
        temperature: DEFAULT_CHAT_CONFIG.temperature,
        top_p: DEFAULT_CHAT_CONFIG.top_p,
        top_k: DEFAULT_CHAT_CONFIG.top_k,
      },
    });
  };
  const handleWorkflowSave = async (data: CreateWorkflowFormSchema) => {
    await createWorkflow({
      token: auth?.api_v2_key ?? '',
      nodeAddress: auth?.node_address ?? '',
      raw: data.workflowRaw ?? '',
      description: data.workflowDescription,
    });
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

  return (
    <div className="h-full space-y-6 overflow-y-auto px-4 pb-4">
      <div className="flex items-center gap-3">
        <div className="flex w-full items-center justify-between pt-5">
          <span className="text-base font-medium text-white">
            BAML Template
          </span>
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
                      {Object.keys(BAML_EXAMPLES).map((key) => (
                        <CommandItem
                          className="text-xs text-white"
                          key={key}
                          onSelect={() => {
                            handleBamlScriptChange(key);
                            setOpenWorkflowList(false);
                          }}
                        >
                          <span>{BAML_EXAMPLES?.[key]?.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />

                    <CommandGroup heading="Your BAML">
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
              open={workflowDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  className="flex h-8 gap-1.5 rounded-lg"
                  disabled={
                    currentBamlScriptName.length === 0 ||
                    currentBamlInput.length === 0 ||
                    currentDslFile.length === 0 ||
                    currentFunctionName.length === 0 ||
                    currentParamName.length === 0
                  }
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

      <Form {...bamlForm}>
        <form
          className="space-y-3"
          onSubmit={bamlForm.handleSubmit(onBamlSubmit)}
        >
          <div className="max-h-[71vh] space-y-5 overflow-y-auto pr-1">
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
                          maxHeight={500}
                          minHeight={400}
                          placeholder="Enter BAML input"
                          resize="vertical"
                          spellCheck={false}
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
                          maxHeight={500}
                          minHeight={400}
                          placeholder="Enter DSL file content"
                          resize="vertical"
                          spellCheck={false}
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
                          spellCheck={false}
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
                          spellCheck={false}
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
export default BamlEditor;

function getWorkflowFromBaml(
  bamlScriptName: string,
  escapedDslFile: string,
  escapedBamlInput: string,
  paramName: string,
  functionName: string,
) {
  const bamlName = bamlScriptName.replace(/[^a-zA-Z0-9]/g, '_');
  return `workflow baml_${bamlName} v0.1 {
      step Initialize {
        $DSL = "${escapedDslFile}"
        $INPUT = "${escapedBamlInput}"
        $PARAM = "${paramName}"
        $FUNCTION = "${functionName}"
        $RESULT = call baml_inference($INPUT, "", "", $DSL, $FUNCTION, $PARAM)
      }
    } @@localhost.arb-sep-shinkai`;
}
