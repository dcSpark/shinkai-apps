import { zodResolver } from '@hookform/resolvers/zod';
import { ReloadIcon } from '@radix-ui/react-icons';
import { FormProps } from '@rjsf/core';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { ToolMetadata } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import {
  buildInboxIdFromJobId,
  extractJobIdFromInbox,
} from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useCreateToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolCode/useCreateToolCode';
import { useCreateToolMetadata } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolMetadata/useCreateToolMetadata';
import { useExecuteToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/executeToolCode/useExecuteToolCode';
import { useRestoreToolConversation } from '@shinkai_network/shinkai-node-state/v2/mutations/restoreToolConversation/useRestoreToolConversation';
import { useSaveToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/saveToolCode/useSaveToolCode';
import { useUpdateToolCodeImplementation } from '@shinkai_network/shinkai-node-state/v2/mutations/updateToolCodeImplementation/useUpdateToolCodeImplementation';
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import {
  Badge,
  Button,
  ChatInputArea,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  JsonForm,
  MessageList,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { SendIcon } from '@shinkai_network/shinkai-ui/assets';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  BoltIcon,
  Loader2,
  LucideArrowLeft,
  Play,
  Redo2Icon,
  Save,
  Undo2Icon,
} from 'lucide-react';
import { InfoCircleIcon } from 'primereact/icons/infocircle';
import { PrismEditor } from 'prism-react-editor';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { Link, To, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { AIModelSelector } from '../components/chat/chat-action-bar/ai-update-selection-action-bar';
import { actionButtonClassnames } from '../components/chat/conversation-footer';
import { ToolErrorFallback } from '../components/playground-tool/error-boundary';
import { useToolCode } from '../components/playground-tool/hooks/use-tool-code';
import { useToolMetadata } from '../components/playground-tool/hooks/use-tool-metadata';
import PlaygroundToolLayout from '../components/playground-tool/layout';
import { ToolMetadataSchema } from '../components/playground-tool/schemas';
import ToolCodeEditor from '../components/playground-tool/tool-code-editor';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';

export const createToolCodeFormSchema = z.object({
  message: z.string().min(1),
  llmProviderId: z.string().min(1),
  tools: z.array(z.string()),
});

export type CreateToolCodeFormSchema = z.infer<typeof createToolCodeFormSchema>;

export function extractTypeScriptCode(message: string) {
  const tsCodeMatch = message.match(/```typescript\n([\s\S]*?)\n```/);
  return tsCodeMatch ? tsCodeMatch[1].trim() : null;
}

function CreateToolPage() {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();
  const toolResultBoxRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);

  const [isDirty, setIsDirty] = useState(false);
  const [toolResult, setToolResult] = useState<object | null>(null);
  const [chatInboxId, setChatInboxId] = useState<string | undefined>(undefined);
  const [chatInboxIdMetadata, setChatInboxIdMetadata] = useState<
    string | undefined
  >(undefined);

  const {
    toolCode,
    setToolCode,
    baseToolCodeRef,
    isToolCodeGenerationPending,
    isToolCodeGenerationSuccess,
    // isToolCodeGenerationIdle,
    // isToolCodeGenerationError,
    // toolCodeGenerationData,
    fetchPreviousPage,
    hasPreviousPage,
    isChatConversationLoading,
    isFetchingPreviousPage,
    isChatConversationSuccess,
    chatConversationData,
    toolHistory,
  } = useToolCode({ chatInboxId });

  const {
    isMetadataGenerationPending,
    isMetadataGenerationSuccess,
    isMetadataGenerationIdle,
    metadataGenerationData,
    metadataGenerationError,
    isMetadataGenerationError,
    forceGenerateMetadata,
  } = useToolMetadata({ chatInboxIdMetadata, code: toolCode });

  const codeEditorRef = useRef<PrismEditor | null>(null);
  const metadataEditorRef = useRef<PrismEditor | null>(null);
  const [resetCounter, setResetCounter] = useState(0);

  const form = useForm<CreateToolCodeFormSchema>({
    resolver: zodResolver(createToolCodeFormSchema),
    defaultValues: {
      message: '',
      tools: [],
    },
  });

  const { mutateAsync: createToolMetadata } = useCreateToolMetadata();
  const {
    mutateAsync: executeCode,
    isPending: isExecutingCode,
    isSuccess: isCodeExecutionSuccess,
    isError: isCodeExecutionError,
    error: codeExecutionError,
    reset: resetCodeExecution,
  } = useExecuteToolCode({
    onSuccess: (data) => {
      setToolResult(data);
      toolResultBoxRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    },
  });

  const { mutateAsync: updateToolCodeImplementation } =
    useUpdateToolCodeImplementation();

  const { mutateAsync: saveToolCode, isPending: isSavingTool } =
    useSaveToolCode({
      onSuccess: (data) => {
        toast.success('Tool code saved successfully');
        navigate(`/tools/${data.metadata.tool_router_key}`);
      },
      onError: (error) => {
        toast.error('Failed to save tool code', {
          position: 'top-right',
          description: error.response?.data?.message ?? error.message,
        });
      },
    });

  const {
    mutateAsync: restoreToolConversation,
    isPending: isRestoringToolConversation,
  } = useRestoreToolConversation({
    onSuccess: () => {
      toast.success('Successfully restore changes');
    },
    onError: (error) => {
      toast.error('Failed to restore tool conversation', {
        position: 'top-right',
        description: error.response?.data?.message ?? error.message,
      });
    },
  });

  const defaultAgentId = useSettings(
    (settingsStore) => settingsStore.defaultAgentId,
  );

  const { mutateAsync: createToolCode } = useCreateToolCode({
    onSuccess: (data) => {
      setChatInboxId(data.inbox);
      setToolCode('');
      forceGenerateMetadata.current = true;
      baseToolCodeRef.current = '';
      setToolResult(null);
      resetCodeExecution();
    },
  });

  const regenerateToolMetadata = useCallback(async () => {
    return await createToolMetadata(
      {
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        jobId: extractJobIdFromInbox(chatInboxId ?? '') ?? '',
        tools: form.getValues('tools'),
      },
      {
        onSuccess: (data) => {
          setChatInboxIdMetadata(buildInboxIdFromJobId(data.job_id));
        },
      },
    );
  }, [auth?.api_v2_key, auth?.node_address, chatInboxId, createToolMetadata]);

  useEffect(() => {
    form.setValue('llmProviderId', defaultAgentId);
  }, [form, defaultAgentId]);

  useEffect(() => {
    if (!toolCode || !forceGenerateMetadata.current) return;
    const run = async () => {
      await createToolMetadata(
        {
          nodeAddress: auth?.node_address ?? '',
          token: auth?.api_v2_key ?? '',
          jobId: extractJobIdFromInbox(chatInboxId ?? ''),
          tools: form.getValues('tools'),
        },
        {
          onSuccess: (data) => {
            setChatInboxIdMetadata(buildInboxIdFromJobId(data.job_id));
            forceGenerateMetadata.current = false;
          },
        },
      );
    };
    run();
  }, [
    auth?.api_v2_key,
    auth?.node_address,
    createToolCode,
    defaultAgentId,
    toolCode,
  ]);

  const onSubmit = async (data: CreateToolCodeFormSchema) => {
    if (!auth) return;

    await createToolCode({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      message: data.message,
      llmProviderId: data.llmProviderId,
      jobId: chatInboxId ? extractJobIdFromInbox(chatInboxId ?? '') : undefined,
      tools: data.tools,
    });

    form.setValue('message', '');
    return;
  };

  const handleRunCode: FormProps['onSubmit'] = async (data) => {
    const params = data.formData;
    const updatedCodeWithoutSave = codeEditorRef.current?.value ?? '';
    await executeCode({
      code: isDirty ? updatedCodeWithoutSave : toolCode,
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      params,
      llmProviderId: form.getValues('llmProviderId'),
      tools: form.getValues('tools'),
    });
  };

  const handleSaveTool = async () => {
    if (!chatInboxId) return;

    const metadataCode = metadataEditorRef.current?.value;
    const toolCode = codeEditorRef.current?.value;

    let parsedMetadata: ToolMetadata;

    try {
      const parseResult = JSON.parse(metadataCode as string) as ToolMetadata;
      parsedMetadata = ToolMetadataSchema.parse(parseResult);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error('Invalid Metadata JSON Value', {
          description: error.issues.map((issue) => issue.message).join(', '),
        });
        return;
      }

      toast.error('Invalid Metadata JSON', {
        position: 'top-right',
        description: (error as Error)?.message,
      });
      return;
    }

    await saveToolCode({
      code: toolCode,
      metadata: parsedMetadata,
      jobId: extractJobIdFromInbox(chatInboxId),
      token: auth?.api_v2_key ?? '',
      nodeAddress: auth?.node_address ?? '',
    });
  };

  return (
    <PlaygroundToolLayout
      leftElement={
        <>
          <div className="flex items-center gap-3 px-2">
            <Link to={-1 as To}>
              <LucideArrowLeft className="text-gray-80 size-[18px]" />
              <span className="sr-only">{t('common.back')}</span>
            </Link>
            <h1 className="py-2 text-base font-semibold tracking-tight">
              Tool Playground
            </h1>
          </div>
          <div
            className={cn(
              'flex flex-1 flex-col overflow-y-auto',
              !chatInboxId && 'items-center justify-center gap-2 text-center',
            )}
          >
            {!chatInboxId && (
              <>
                <span aria-hidden className="text-3xl">
                  🤖
                </span>
                <h2 className="text-base font-medium">
                  Generate your tool using AI
                </h2>
                <p className="text-gray-80 mb-8 text-xs">
                  Ask Shinkai AI to generate a tool for you. Provide a prompt
                  and Shinkai AI will generate a tool code for you.
                </p>
                <div className="grid grid-cols-1 items-center gap-3">
                  {[
                    {
                      text: 'Tool for downloading a website content in markdown',
                      prompt:
                        'Generate a tool for downloading a website into markdown',
                    },
                    {
                      text: 'Tool for getting tech-related stories from Hacker News',
                      prompt:
                        'Generate a tool for getting top tech-related stories from Hacker News, include the title, author, and URL of the story',
                    },
                  ].map((suggestion) => (
                    <Badge
                      className="cursor-pointer justify-between bg-gray-300 py-2 text-left font-normal normal-case text-gray-50 transition-colors hover:bg-gray-200"
                      key={suggestion.text}
                      onClick={() =>
                        form.setValue('message', suggestion.prompt)
                      }
                      variant="outline"
                    >
                      {suggestion.text}
                      <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
                    </Badge>
                  ))}
                </div>
              </>
            )}

            {chatInboxId && (
              <MessageList
                containerClassName="px-5"
                disabledRetryAndEdit={true}
                fetchPreviousPage={fetchPreviousPage}
                hasPreviousPage={hasPreviousPage}
                isFetchingPreviousPage={isFetchingPreviousPage}
                isLoading={isChatConversationLoading}
                isSuccess={isChatConversationSuccess}
                noMoreMessageLabel={t('chat.allMessagesLoaded')}
                paginatedMessages={chatConversationData}
              />
            )}
          </div>

          <Form {...form}>
            <form
              className="shrink-0 space-y-2 pt-2"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="flex shrink-0 items-center gap-1">
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-0">
                      <FormLabel className="sr-only">
                        {t('chat.enterMessage')}
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <AIModelSelector
                              onValueChange={(value) => {
                                form.setValue('llmProviderId', value);
                              }}
                              value={form.watch('llmProviderId')}
                            />
                            <ToolSelectionModal form={form} />
                          </div>
                          <ChatInputArea
                            autoFocus
                            bottomAddons={
                              <div className="relative z-50 flex items-end gap-3 self-end">
                                <span className="pb-1 text-xs font-light text-gray-100">
                                  <span className="font-medium">Enter</span> to
                                  send
                                </span>
                                <Button
                                  className={cn(
                                    'hover:bg-app-gradient h-[40px] w-[40px] cursor-pointer rounded-xl bg-gray-500 p-3 transition-colors',
                                    'disabled:text-gray-80 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border disabled:border-gray-200 disabled:bg-gray-300 hover:disabled:bg-gray-300',
                                  )}
                                  disabled={
                                    isToolCodeGenerationPending ||
                                    isMetadataGenerationPending ||
                                    !form.watch('message')
                                  }
                                  onClick={form.handleSubmit(onSubmit)}
                                  size="icon"
                                  variant="tertiary"
                                >
                                  <SendIcon className="h-full w-full" />
                                  <span className="sr-only">
                                    {t('chat.sendMessage')}
                                  </span>
                                </Button>
                              </div>
                            }
                            disabled={
                              isToolCodeGenerationPending ||
                              isMetadataGenerationPending
                            }
                            onChange={field.onChange}
                            onSubmit={form.handleSubmit(onSubmit)}
                            topAddons={<></>}
                            value={field.value}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </>
      }
      rightElement={
        <Tabs
          className="flex h-screen w-full flex-col overflow-hidden"
          defaultValue="code"
        >
          <div className={'flex flex-grow justify-stretch'}>
            <div className="flex size-full flex-col gap-2">
              <div className="flex shrink-0 items-center justify-between gap-2">
                <TabsList className="grid grid-cols-2 rounded-lg border border-gray-400 bg-transparent p-0.5">
                  <TabsTrigger
                    className="flex h-8 items-center gap-1.5 text-xs font-semibold"
                    value="code"
                  >
                    Code
                  </TabsTrigger>
                  <TabsTrigger
                    className="flex h-8 items-center gap-1.5 text-xs font-semibold"
                    value="preview"
                  >
                    Metadata
                  </TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-6">
                  {toolHistory.length > 1 && (
                    <div className="flex items-center gap-4">
                      {toolCode === toolHistory?.at(-1)?.code ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              className="border-cyan-600 bg-cyan-900/20 font-normal text-cyan-400"
                              variant="inputAdornment"
                            >
                              Latest
                            </Badge>
                          </TooltipTrigger>
                          <TooltipPortal>
                            <TooltipContent side="bottom">
                              <p>This is your latest version</p>
                            </TooltipContent>
                          </TooltipPortal>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              className="bg-gray-350 cursor-pointer border-0 px-2.5 py-2 hover:bg-gray-400"
                              onClick={async () => {
                                const currentIdx = toolHistory.findIndex(
                                  (history) => history.code === toolCode,
                                );

                                await restoreToolConversation({
                                  token: auth?.api_v2_key ?? '',
                                  nodeAddress: auth?.node_address ?? '',
                                  jobId: extractJobIdFromInbox(
                                    chatInboxId ?? '',
                                  ),
                                  messageId: toolHistory[currentIdx].messageId,
                                });
                              }}
                              variant="secondary"
                            >
                              {isRestoringToolConversation ? (
                                <Loader2
                                  className={cn('mr-2 h-4 w-4 animate-spin')}
                                />
                              ) : null}
                              <span>Restore</span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipPortal>
                            <TooltipContent className="max-w-sm" side="bottom">
                              <p>
                                Restore to this version. This action will undo
                                all changes made since the selected version
                              </p>
                            </TooltipContent>
                          </TooltipPortal>
                        </Tooltip>
                      )}
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger
                            asChild
                            disabled={toolCode === toolHistory?.at(0)?.code}
                          >
                            <Button
                              className="size-[30px] rounded-lg p-1 disabled:pointer-events-none disabled:bg-transparent disabled:text-gray-100"
                              onClick={async () => {
                                const currentIdx = toolHistory.findIndex(
                                  (history) => history.code === toolCode,
                                );
                                const prevTool = toolHistory[currentIdx - 1];

                                const messageEl = document.getElementById(
                                  prevTool.messageId,
                                );
                                baseToolCodeRef.current = prevTool.code;
                                setToolCode(prevTool.code);
                                setResetCounter((prev) => prev + 1);
                                if (messageEl) {
                                  // wait til requestAnimationFrame for scrolling
                                  setTimeout(() => {
                                    messageEl.scrollIntoView({
                                      behavior: 'smooth',
                                      block: 'start',
                                    });
                                  }, 100);
                                }
                              }}
                              size="auto"
                              variant="ghost"
                            >
                              <Undo2Icon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipPortal>
                            <TooltipContent side="bottom">
                              <p>View previous version</p>
                            </TooltipContent>
                          </TooltipPortal>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger
                            asChild
                            disabled={toolCode === toolHistory?.at(-1)?.code}
                          >
                            <Button
                              className="size-[30px] rounded-lg p-1 disabled:pointer-events-none disabled:bg-transparent disabled:text-gray-100"
                              onClick={() => {
                                const currentIdx = toolHistory.findIndex(
                                  (history) => history.code === toolCode,
                                );
                                const nextTool = toolHistory[currentIdx + 1];
                                baseToolCodeRef.current = nextTool.code;
                                setToolCode(nextTool.code);
                                setResetCounter((prev) => prev + 1);

                                const messageEl = document.getElementById(
                                  nextTool.messageId,
                                );
                                if (messageEl) {
                                  setTimeout(() => {
                                    messageEl.scrollIntoView({
                                      behavior: 'smooth',
                                      block: 'start',
                                    });
                                  }, 100);
                                }
                              }}
                              size="auto"
                              variant="ghost"
                            >
                              <Redo2Icon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipPortal>
                            <TooltipContent side="bottom">
                              <p>View next version</p>
                            </TooltipContent>
                          </TooltipPortal>
                        </Tooltip>
                      </div>
                    </div>
                  )}
                  <Button
                    className="text-gray-80 h-[30px] shrink-0 rounded-md text-xs"
                    disabled={
                      !toolCode ||
                      !metadataGenerationData ||
                      !chatInboxId ||
                      isSavingTool
                    }
                    isLoading={isSavingTool}
                    onClick={handleSaveTool}
                    size="sm"
                    variant="outline"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Tool
                  </Button>
                </div>
              </div>
              <TabsContent
                className="mt-0 flex-1 space-y-4 overflow-y-auto whitespace-pre-line break-words data-[state=inactive]:hidden"
                forceMount
                value="code"
              >
                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel
                    className="flex flex-col"
                    defaultSize={60}
                    maxSize={70}
                    minSize={30}
                  >
                    <div className="flex size-full min-h-[220px] flex-col rounded-lg bg-gray-300 pb-4 pl-4 pr-3">
                      <div className="flex h-full flex-col">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-gray-80 flex flex-col gap-1 py-3 text-xs">
                            <h2 className="flex items-center gap-2 font-mono font-semibold text-gray-50">
                              Code{' '}
                            </h2>
                            {toolCode && (
                              <p>
                                {/* eslint-disable-next-line react/no-unescaped-entities */}
                                Here's the code generated by Shinkai AI based on
                                your prompt.
                              </p>
                            )}
                          </div>

                          {/*{toolCode && (*/}
                          {/*  <Tooltip>*/}
                          {/*    <TooltipTrigger asChild>*/}
                          {/*      <div>*/}
                          {/*        <CopyToClipboardIcon*/}
                          {/*          className="text-gray-80 flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-transparent transition-colors hover:bg-gray-300 hover:text-white [&>svg]:h-3 [&>svg]:w-3"*/}
                          {/*          string={toolCode ?? ''}*/}
                          {/*        />*/}
                          {/*      </div>*/}
                          {/*    </TooltipTrigger>*/}
                          {/*    <TooltipPortal>*/}
                          {/*      <TooltipContent className="flex flex-col items-center gap-1">*/}
                          {/*        <p>Copy Code</p>*/}
                          {/*      </TooltipContent>*/}
                          {/*    </TooltipPortal>*/}
                          {/*  </Tooltip>*/}
                          {/*)}*/}
                        </div>
                        <div className="flex-1 overflow-auto">
                          {isToolCodeGenerationPending && (
                            <div className="text-gray-80 flex flex-col items-center gap-2 py-4 text-xs">
                              <Loader2 className="shrink-0 animate-spin" />
                              Generating Code...
                            </div>
                          )}
                          {!isToolCodeGenerationPending &&
                            !toolCode &&
                            !isToolCodeGenerationSuccess && (
                              <p className="text-gray-80 pt-6 text-center text-xs">
                                No code generated yet. <br />
                                Ask Shinkai AI to generate your tool code.
                              </p>
                            )}
                          {isToolCodeGenerationSuccess && toolCode && (
                            <form
                              className="flex size-full flex-col"
                              key={resetCounter}
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const data = new FormData(e.currentTarget);
                                const currentEditorValue = data.get('editor');
                                setResetCounter((prev) => prev + 1);
                                setIsDirty(false);
                                baseToolCodeRef.current =
                                  currentEditorValue as string;
                                // forceGenerateMetadata.current = true; // do not force it, user can regenerate it in the UI

                                await updateToolCodeImplementation({
                                  token: auth?.api_v2_key ?? '',
                                  nodeAddress: auth?.node_address ?? '',
                                  jobId: extractJobIdFromInbox(
                                    chatInboxId ?? '',
                                  ),
                                  code: currentEditorValue as string,
                                });

                                setTimeout(() => {
                                  setToolCode(currentEditorValue as string);
                                }, 0);
                              }}
                            >
                              <div className="flex h-[45px] items-center justify-between rounded-t-lg border-b border-gray-400 bg-[#0d1117] px-3 py-2">
                                <span className="inline-flex items-center gap-2 pl-3 text-xs font-medium text-gray-50">
                                  {' '}
                                  TypeScript
                                  {isDirty && (
                                    <span className="size-2 shrink-0 rounded-full bg-orange-500" />
                                  )}
                                </span>
                                <AnimatePresence>
                                  {isDirty && (
                                    <motion.div
                                      animate={{ opacity: 1 }}
                                      className="flex items-center justify-end gap-2"
                                      exit={{ opacity: 0 }}
                                      initial={{ opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <Button
                                        className="!h-[32px] min-w-[80px] rounded-xl"
                                        onClick={() => {
                                          setIsDirty(false);
                                          setResetCounter((prev) => prev + 1);
                                          forceGenerateMetadata.current = true;
                                          setTimeout(() => {
                                            setToolCode(
                                              baseToolCodeRef.current,
                                            );
                                          }, 0);
                                        }}
                                        size="sm"
                                        type="reset"
                                        variant="outline"
                                      >
                                        Reset
                                      </Button>
                                      <Button
                                        className="!h-[28px] min-w-[80px] rounded-xl"
                                        size="sm"
                                        type="submit"
                                        variant="outline"
                                      >
                                        Apply Changes
                                      </Button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              <ToolCodeEditor
                                language="ts"
                                name="editor"
                                onUpdate={(currentCode) => {
                                  setIsDirty(
                                    currentCode !== baseToolCodeRef.current,
                                  );
                                }}
                                ref={codeEditorRef}
                                value={toolCode}
                              />
                            </form>
                          )}
                        </div>
                      </div>
                    </div>
                  </ResizablePanel>
                  <ResizableHandle className="my-4 bg-gray-300" withHandle />

                  <ResizablePanel className="flex flex-col">
                    <div className="flex size-full min-h-[220px] flex-col rounded-lg bg-gray-300 pb-4 pl-4 pr-3">
                      <div className="flex items-center justify-between">
                        <div className="text-gray-80 flex flex-col gap-1 py-3 text-xs">
                          <h2 className="flex font-mono font-semibold text-gray-50">
                            Run
                          </h2>
                          {metadataGenerationData && (
                            <p>Fill in the options above to run your tool.</p>
                          )}
                        </div>
                        {isMetadataGenerationSuccess &&
                          !isToolCodeGenerationPending &&
                          !isMetadataGenerationError && (
                            <Button
                              className="h-[30px] rounded-lg border-gray-200 text-white"
                              form="parameters-form"
                              isLoading={isExecutingCode}
                              size="sm"
                              variant="ghost"
                            >
                              {!isExecutingCode && (
                                <Play className="mr-2 h-4 w-4" />
                              )}
                              Run
                            </Button>
                          )}
                      </div>
                      <div className="flex-1 overflow-auto">
                        {(isMetadataGenerationPending ||
                          isToolCodeGenerationPending) && (
                          <div className="text-gray-80 flex flex-col items-center gap-2 py-4 text-xs">
                            <Loader2 className="shrink-0 animate-spin" />
                            Generating...
                          </div>
                        )}
                        {!isMetadataGenerationPending &&
                          !isToolCodeGenerationPending &&
                          isMetadataGenerationError && (
                            <ToolErrorFallback
                              error={new Error(metadataGenerationError ?? '')}
                              resetErrorBoundary={regenerateToolMetadata}
                            />
                          )}
                        {isMetadataGenerationSuccess &&
                          !isToolCodeGenerationPending &&
                          !isMetadataGenerationError && (
                            <div className="text-gray-80 size-full text-xs">
                              <JsonForm
                                className="py-4"
                                formData={formData}
                                id="parameters-form"
                                noHtml5Validate={true}
                                onChange={(e) => setFormData(e.formData)}
                                onSubmit={handleRunCode}
                                schema={
                                  metadataGenerationData?.parameters as RJSFSchema
                                }
                                uiSchema={{
                                  'ui:submitButtonOptions': {
                                    norender: true,
                                  },
                                }}
                                validator={validator}
                              />
                              <AnimatePresence>
                                {(isExecutingCode ||
                                  isCodeExecutionError ||
                                  isCodeExecutionSuccess) && (
                                  <motion.div
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex flex-col border-t border-gray-200 bg-gray-300 pt-2"
                                    exit={{ opacity: 0, x: 20 }}
                                    initial={{ opacity: 0, x: 20 }}
                                  >
                                    {isExecutingCode && (
                                      <div className="text-gray-80 flex flex-col items-center gap-2 py-4 text-xs">
                                        <Loader2 className="shrink-0 animate-spin" />
                                        Running Tool...
                                      </div>
                                    )}
                                    {isCodeExecutionError && (
                                      <div className="mt-2 flex flex-col items-center gap-2 bg-red-900/20 px-3 py-4 text-xs text-red-400">
                                        <p>
                                          Tool execution failed. Try generating
                                          the tool code again.
                                        </p>
                                        <pre className="whitespace-break-spaces px-4 text-center">
                                          {codeExecutionError?.response?.data
                                            ?.message ??
                                            codeExecutionError?.message}
                                        </pre>
                                      </div>
                                    )}
                                    <div ref={toolResultBoxRef}>
                                      {isCodeExecutionSuccess && toolResult && (
                                        <ToolCodeEditor
                                          language="json"
                                          readOnly
                                          value={JSON.stringify(
                                            toolResult,
                                            null,
                                            2,
                                          )}
                                        />
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        {isMetadataGenerationIdle &&
                          !isToolCodeGenerationPending && (
                            <div>
                              <p className="text-gray-80 py-4 pt-6 text-center text-xs">
                                No metadata generated yet.
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </TabsContent>
              <TabsContent
                className="mt-0 flex-1 space-y-4 overflow-y-auto whitespace-pre-line break-words data-[state=inactive]:hidden"
                forceMount
                value="preview"
              >
                <div className="flex min-h-[200px] flex-col rounded-lg bg-gray-300 pb-4 pl-4 pr-3">
                  <div className="flex items-start justify-between gap-2 py-3">
                    <div className="text-gray-80 flex flex-col gap-1 text-xs">
                      <h2 className="flex font-mono font-semibold text-gray-50">
                        Metadata
                      </h2>
                      {metadataGenerationData && (
                        <p>Fill in the options above to run your tool.</p>
                      )}
                    </div>
                    {isMetadataGenerationSuccess && (
                      <Button
                        className="text-gray-80 h-[30px] gap-2 rounded-md text-xs"
                        onClick={regenerateToolMetadata}
                        size="sm"
                        variant="outline"
                      >
                        <ReloadIcon className="size-3.5" />
                        Regenerate Metadata
                      </Button>
                    )}
                  </div>
                  {isMetadataGenerationPending && (
                    <div className="text-gray-80 flex flex-col items-center gap-2 py-4 text-xs">
                      <Loader2 className="shrink-0 animate-spin" />
                      Generating Metadata...
                    </div>
                  )}
                  {!isMetadataGenerationPending &&
                    !isToolCodeGenerationPending &&
                    isMetadataGenerationError && (
                      <ToolErrorFallback
                        error={new Error(metadataGenerationError ?? '')}
                        resetErrorBoundary={regenerateToolMetadata}
                      />
                    )}

                  {isMetadataGenerationSuccess &&
                    !isMetadataGenerationError && (
                      <div className="text-gray-80 text-xs">
                        <div className="py-2">
                          <ToolCodeEditor
                            language="json"
                            ref={metadataEditorRef}
                            style={{ height: '80vh' }}
                            value={
                              metadataGenerationData != null
                                ? JSON.stringify(
                                    metadataGenerationData,
                                    null,
                                    2,
                                  )
                                : 'Invalid metadata'
                            }
                          />
                        </div>
                      </div>
                    )}
                  {isMetadataGenerationIdle && (
                    <div>
                      <p className="text-gray-80 py-4 pt-6 text-center text-xs">
                        No metadata generated yet.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      }
    />
  );
}

export default CreateToolPage;

export function ToolSelectionModal({
  form,
}: {
  form: UseFormReturn<CreateToolCodeFormSchema>;
}) {
  const auth = useAuth((state) => state.auth);

  const { data: toolsList } = useGetTools({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  return (
    <TooltipProvider delayDuration={0}>
      <Popover>
        <PopoverTrigger asChild>
          <div
            className={cn(actionButtonClassnames, 'w-[90px]')}
            role="button"
            tabIndex={0}
          >
            Tools{' '}
            <Badge className="bg-brand inline-flex h-5 w-5 items-center justify-center rounded-full border-gray-200 p-0 text-center text-gray-50">
              {form.watch('tools').length}
            </Badge>
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="flex w-full max-w-xl flex-col gap-3 bg-gray-300 p-4 pr-1 text-xs"
        >
          <div className="flex items-center justify-between pr-3">
            <p className="font-semibold text-white">Available tools</p>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.watch('tools').length === toolsList?.length}
                id="all"
                onCheckedChange={(checked) => {
                  const isAllConfigFilled = toolsList
                    ?.map((tool) => tool.config)
                    .filter((item) => !!item)
                    .flat()
                    ?.map((conf) => ({
                      key_name: conf.BasicConfig.key_name,
                      key_value: conf.BasicConfig.key_value ?? '',
                      required: conf.BasicConfig.required,
                    }))
                    .every(
                      (conf) =>
                        !conf.required ||
                        (conf.required && conf.key_value !== ''),
                    );
                  if (!isAllConfigFilled) {
                    toast.error('Tool configuration', {
                      description:
                        'Please fill in the config required in tool details',
                    });
                    return;
                  }

                  if (checked && toolsList) {
                    form.setValue(
                      'tools',
                      toolsList.map((tool) => tool.tool_router_key),
                    );
                  } else {
                    form.setValue('tools', []);
                  }
                }}
              />
              <label className="text-xs text-gray-50" htmlFor="all">
                Enabled All
              </label>
            </div>
          </div>

          <div className="flex max-h-[28vh] flex-col gap-2.5 overflow-auto pr-2">
            {toolsList?.map((tool) => (
              <FormField
                control={form.control}
                key={tool.tool_router_key}
                name="tools"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col gap-3">
                    <FormControl>
                      <div className="flex w-full items-center gap-3">
                        <Switch
                          checked={field.value.includes(tool.tool_router_key)}
                          id={tool.tool_router_key}
                          onCheckedChange={() => {
                            const configs = tool?.config ?? [];
                            if (
                              configs
                                .map((conf) => ({
                                  key_name: conf.BasicConfig.key_name,
                                  key_value: conf.BasicConfig.key_value ?? '',
                                  required: conf.BasicConfig.required,
                                }))
                                .every(
                                  (conf) =>
                                    !conf.required ||
                                    (conf.required && conf.key_value !== ''),
                                )
                            ) {
                              field.onChange(
                                field.value.includes(tool.tool_router_key)
                                  ? field.value.filter(
                                      (value) => value !== tool.tool_router_key,
                                    )
                                  : [...field.value, tool.tool_router_key],
                              );
                              console.log(tool.config, 'tool.config');
                              return;
                            }
                            toast.error('Tool configuration is required', {
                              description:
                                'Please fill in the config required in tool details',
                            });
                          }}
                        />
                        <div className="inline-flex flex-1 items-center gap-2 leading-none">
                          <label
                            className="max-w-[40ch] truncate text-xs text-gray-50"
                            htmlFor={tool.tool_router_key}
                          >
                            {formatText(tool.name)}
                          </label>
                          <Tooltip>
                            <TooltipTrigger className="flex shrink-0 items-center gap-1">
                              <InfoCircleIcon className="h-3 w-3 text-gray-100" />
                            </TooltipTrigger>
                            <TooltipPortal>
                              <TooltipContent
                                align="center"
                                alignOffset={-10}
                                className="max-w-md"
                                side="top"
                              >
                                {tool.description}
                              </TooltipContent>
                            </TooltipPortal>
                          </Tooltip>
                        </div>
                        {(tool.config ?? []).length > 0 && (
                          <Tooltip>
                            <TooltipTrigger
                              asChild
                              className="flex shrink-0 items-center gap-1"
                            >
                              <Link
                                className="text-gray-80 size-3.5 rounded-lg hover:text-white"
                                to={`/tools/${tool.tool_router_key}`}
                              >
                                <BoltIcon className="size-full" />
                              </Link>
                            </TooltipTrigger>
                            <TooltipPortal>
                              <TooltipContent
                                align="center"
                                alignOffset={-10}
                                className="max-w-md"
                                side="top"
                              >
                                <p>Configure tool</p>
                              </TooltipContent>
                            </TooltipPortal>
                          </Tooltip>
                        )}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
