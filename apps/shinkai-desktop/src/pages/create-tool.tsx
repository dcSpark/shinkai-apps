import 'prism-react-editor/prism/languages/typescript';
import 'prism-react-editor/languages/typoscript';
import 'prism-react-editor/layout.css';
import 'prism-react-editor/themes/github-dark.css';
import 'prism-react-editor/search.css';

import { zodResolver } from '@hookform/resolvers/zod';
import { DialogClose } from '@radix-ui/react-dialog';
import { ReloadIcon } from '@radix-ui/react-icons';
import { FormProps } from '@rjsf/core';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  ShinkaiTool,
  ToolMetadata,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';
import {
  buildInboxIdFromJobId,
  extractJobIdFromInbox,
} from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useCreateToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolCode/useCreateToolCode';
import { useCreateToolMetadata } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolMetadata/useCreateToolMetadata';
import { useExecuteToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/executeToolCode/useExecuteToolCode';
import { useSaveToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/saveToolCode/useSaveToolCode';
import { useUpdateTool } from '@shinkai_network/shinkai-node-state/v2/mutations/updateTool/useUpdateTool';
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import {
  Badge,
  Button,
  ChatInputArea,
  CopyToClipboardIcon,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  JsonForm,
  MarkdownPreview,
  MessageList,
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
import JsonView from '@uiw/react-json-view';
import { githubDarkTheme } from '@uiw/react-json-view/githubDark';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  Loader2,
  Play,
  Save,
  XCircle,
  XIcon,
} from 'lucide-react';
import { InfoCircleIcon } from 'primereact/icons/infocircle';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { AIModelSelector } from '../components/chat/chat-action-bar/ai-update-selection-action-bar';
import { actionButtonClassnames } from '../components/chat/conversation-footer';
import { ToolErrorFallback } from '../components/playground-tool/error-boundary';
import PlaygroundToolLayout from '../components/playground-tool/layout';
import ToolCodeEditor from '../components/playground-tool/tool-code-editor';
import config from '../config';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';
import { useChatConversationWithOptimisticUpdates } from './chat/chat-conversation';

export const createToolCodeFormSchema = z.object({
  message: z.string().min(1),
  llmProviderId: z.string().min(1),
});

const metadataFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  author: z.string().min(1, 'Author is required'),
  keywords: z.array(z.string()),
});
type MetadataFormSchema = z.infer<typeof metadataFormSchema>;

export type CreateToolCodeFormSchema = z.infer<typeof createToolCodeFormSchema>;

function extractTypeScriptCode(message: string) {
  const tsCodeMatch = message.match(/```typescript\n([\s\S]*?)\n```/);
  return tsCodeMatch ? tsCodeMatch[1].trim() : null;
}

function CreateToolPage() {
  const [tab, setTab] = useState<'code' | 'preview'>('code');
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();
  const toolResultBoxRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);

  const [toolCode, setToolCode] = useState<string>('');
  const baseToolCodeRef = useRef<string>('');
  const forceGenerateMetadata = useRef(false);
  const [isDirty, setIsDirty] = useState(false);
  const [toolResult, setToolResult] = useState<object | null>(null);
  const [chatInboxId, setChatInboxId] = useState<string | null>(null);
  const [chatInboxIdMetadata, setChatInboxIdMetadata] = useState<string | null>(
    null,
  );

  const [resetCounter, setResetCounter] = useState(0);

  const form = useForm<CreateToolCodeFormSchema>({
    resolver: zodResolver(createToolCodeFormSchema),
    defaultValues: {
      message: '',
    },
  });

  const {
    data,
    fetchPreviousPage,
    hasPreviousPage,
    isChatConversationLoading,
    isFetchingPreviousPage,
    isChatConversationSuccess,
  } = useChatConversationWithOptimisticUpdates({
    inboxId: chatInboxId ?? '',
    forceRefetchInterval: true,
  });

  const { data: metadataData } = useChatConversationWithOptimisticUpdates({
    inboxId: chatInboxIdMetadata ?? '',
    forceRefetchInterval: true,
  });

  const { mutateAsync: createToolMetadata } = useCreateToolMetadata();
  const {
    isIdle: isCodeExecutionIdle,
    mutateAsync: executeCode,
    isPending: isExecutingCode,
    isSuccess: isCodeExecutionSuccess,
    isError: isCodeExecutionError,
  } = useExecuteToolCode({
    onSuccess: (data) => {
      setToolResult(data);
      toolResultBoxRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    },
    onError: (error) => {
      toast.error('Failed to run tool', {
        description: error.response?.data?.message ?? error.message,
        position: 'top-right',
      });
    },
  });

  const { mutateAsync: saveToolCode } = useSaveToolCode({
    onSuccess: (data) => {
      toast.success('Tool code saved successfully');
      navigate(`/tools/${data.metadata.tool_router_key}`);
    },
  });

  const defaultAgentId = useSettings(
    (settingsStore) => settingsStore.defaultAgentId,
  );
  const { mutateAsync: createToolCode } = useCreateToolCode();

  const regenerateToolMetadata = useCallback(async () => {
    return await createToolMetadata(
      {
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        jobId: extractJobIdFromInbox(chatInboxId ?? '') ?? '',
      },
      {
        onSuccess: (data) => {
          setChatInboxIdMetadata(buildInboxIdFromJobId(data.job_id));
        },
      },
    );
  }, [auth?.api_v2_key, auth?.node_address, chatInboxId, createToolMetadata]);

  const {
    metadataMessageContent,
    isMetadataGenerationPending,
    isMetadataGenerationSuccess,
    isMetadataGenerationIdle,
    metadataGenerationData,
  } = useMemo(() => {
    const metadata = metadataData?.pages?.at(-1)?.at(-1);
    const isMetadataGenerationIdle = metadata == null;
    const isMetadataGenerationPending =
      metadata?.role === 'assistant' && metadata?.status.type === 'running';
    const isMetadataGenerationSuccess =
      metadata?.role === 'assistant' && metadata?.status.type === 'complete';
    let metadataGenerationData = null;
    if (isMetadataGenerationSuccess) {
      const jsonCodeMatch = metadata.content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonCodeMatch) {
        try {
          const parsedJson = JSON.parse(jsonCodeMatch[1].trim());
          metadataGenerationData = parsedJson as ToolMetadata;
        } catch (error) {
          toast.error(
            'Failed to generate preview (json). Try regenerating the preview again.',
            {
              position: 'top-right',
              description: (error as Error)?.message,
              action: {
                label: 'Regenerate',
                onClick: regenerateToolMetadata,
              },
            },
          );
        }
      } else {
        toast.error('Failed to generate preview.', {
          position: 'top-right',
          description: 'No JSON code found. Try to generate preview again',
          action: {
            label: 'Regenerate',
            onClick: regenerateToolMetadata,
          },
        });
      }
    }

    return {
      metadataMessageContent: metadata?.content,
      isMetadataGenerationPending,
      isMetadataGenerationSuccess,
      isMetadataGenerationIdle,
      metadataGenerationData,
    };
  }, [metadataData?.pages, regenerateToolMetadata]);

  const metadataForm = useForm<MetadataFormSchema>({
    resolver: zodResolver(metadataFormSchema),
    defaultValues: {
      name: metadataGenerationData?.name,
      description: metadataGenerationData?.description,
      author: auth?.shinkai_identity ?? '',
      keywords: metadataGenerationData?.keywords ?? [],
    },
  });

  useEffect(() => {
    form.setValue('llmProviderId', defaultAgentId);
  }, [form, defaultAgentId]);

  const isToolGenerating = useMemo(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    return (
      !!chatInboxId &&
      lastMessage?.role === 'assistant' &&
      lastMessage?.status.type === 'running'
    );
  }, [chatInboxId, data?.pages]);

  const isToolGeneratedSuccess = useMemo(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    return (
      !!chatInboxId &&
      lastMessage?.role === 'assistant' &&
      lastMessage?.status.type === 'complete'
    );
  }, [chatInboxId, data?.pages]);

  useEffect(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    if (
      lastMessage?.role === 'assistant' &&
      lastMessage?.status.type === 'complete'
    ) {
      const generatedCode = extractTypeScriptCode(lastMessage?.content) ?? '';
      baseToolCodeRef.current = generatedCode;
      setToolCode(generatedCode);

      return;
    }
  }, [data?.pages]);

  // useWebSocketMessage({
  //   inboxId: chatInboxId ?? '',
  //   enabled: true,
  // });

  const isLoadingMessage = useMemo(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    return (
      !!chatInboxId &&
      lastMessage?.role === 'assistant' &&
      lastMessage?.status.type === 'running'
    );
  }, [data?.pages, chatInboxId]);

  useEffect(() => {
    if (!toolCode || !forceGenerateMetadata.current) return;
    const run = async () => {
      await createToolMetadata(
        {
          nodeAddress: auth?.node_address ?? '',
          token: auth?.api_v2_key ?? '',
          jobId: extractJobIdFromInbox(chatInboxId ?? ''),
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

  useEffect(() => {
    if (!metadataGenerationData) return;
    metadataForm.setValue('name', metadataGenerationData?.name);
    metadataForm.setValue('description', metadataGenerationData?.description);
    metadataForm.setValue('author', auth?.shinkai_identity ?? '');
    metadataForm.setValue('keywords', metadataGenerationData?.keywords);
  }, [auth?.shinkai_identity, metadataForm, metadataGenerationData]);

  const onSubmit = async (data: CreateToolCodeFormSchema) => {
    if (!auth) return;
    await createToolCode(
      {
        nodeAddress: auth.node_address,
        token: auth.api_v2_key,
        message: data.message,
        llmProviderId: data.llmProviderId,
      },
      {
        onSuccess: (data) => {
          setChatInboxId(data.inbox);
          setTab('code');
          setToolCode('');
          forceGenerateMetadata.current = true;
          baseToolCodeRef.current = '';
          setToolResult(null);
        },
      },
    );

    form.setValue('message', '');
    return;
  };

  const handleRunCode: FormProps['onSubmit'] = async (data) => {
    const params = data.formData;
    await executeCode({
      code: toolCode,
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      params,
    });
  };

  const handleSaveTool = async () => {
    if (!isCodeExecutionSuccess) {
      setTab('code');
      toast.error('Please run your tool before saving', {
        position: 'top-right',
      });
      return;
    }

    if (!chatInboxId) return;
    await saveToolCode({
      code: toolCode,
      metadata: {
        ...metadataGenerationData,
        name: metadataForm.getValues('name'),
        description: metadataForm.getValues('description'),
        author: auth?.shinkai_identity ?? '',
      },
      jobId: extractJobIdFromInbox(chatInboxId),
      token: auth?.api_v2_key ?? '',
      nodeAddress: auth?.node_address ?? '',
    });
  };

  return (
    <PlaygroundToolLayout
      leftElement={
        <>
          <h1 className="py-2 text-lg font-semibold tracking-tight">
            Playground
          </h1>
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
                      text: 'Generate a tool that downloads https://jhftss.github.io/',
                      prompt:
                        'Generate a tool that downloads https://jhftss.github.io/',
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
                paginatedMessages={data}
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
                            <ToolSelectionModal />
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
                                    isLoadingMessage ||
                                    isToolGenerating ||
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
                            disabled={isLoadingMessage}
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
          onValueChange={(value) => setTab(value as 'preview' | 'code')}
          value={tab}
        >
          <div className={'flex h-screen flex-grow justify-stretch p-3 pr-0'}>
            <div className="flex size-full flex-col overflow-hidden">
              <div className="flex items-center justify-between gap-2">
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
                <div>
                  <Button
                    className="text-gray-80 h-[30px] rounded-md text-xs"
                    disabled={
                      !toolCode ||
                      !metadataGenerationData ||
                      // !isCodeExecutionSuccess ||
                      !chatInboxId
                    }
                    onClick={async () => {
                      if (!chatInboxId || !metadataGenerationData) return;

                      await saveToolCode({
                        code: toolCode,
                        metadata: {
                          ...metadataGenerationData,
                          name: metadataForm.getValues('name'),
                          description: metadataForm.getValues('description'),
                          author: auth?.shinkai_identity ?? '',
                        },
                        jobId: extractJobIdFromInbox(chatInboxId),
                        token: auth?.api_v2_key ?? '',
                        nodeAddress: auth?.node_address ?? '',
                      });
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Tool
                  </Button>
                </div>
              </div>

              <TabsContent
                className="mt-1 h-full space-y-4 overflow-y-auto whitespace-pre-line break-words py-4 pb-8 pr-3"
                value="code"
              >
                <div className="flex min-h-[250px] flex-col rounded-lg bg-gray-300 pb-4 pl-4 pr-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-gray-80 flex flex-col gap-1 py-3 text-xs">
                      <h2 className="flex items-center gap-2 font-mono font-semibold text-gray-50">
                        Code{' '}
                      </h2>
                      {toolCode && (
                        <p>
                          {/* eslint-disable-next-line react/no-unescaped-entities */}
                          Here's the code generated by Shinkai AI based on your
                          prompt.
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
                  <div className="size-full">
                    {isToolGenerating && (
                      <div className="text-gray-80 flex flex-col items-center gap-2 py-4 text-xs">
                        <Loader2 className="shrink-0 animate-spin" />
                        Generating Code...
                      </div>
                    )}
                    {!isToolGenerating &&
                      !toolCode &&
                      !isToolGeneratedSuccess && (
                        <p className="text-gray-80 pt-6 text-center text-xs">
                          No code generated yet. <br />
                          Ask Shinkai AI to generate your tool code.
                        </p>
                      )}
                    {isToolGeneratedSuccess && toolCode && (
                      <form
                        key={resetCounter}
                        onSubmit={(e) => {
                          e.preventDefault();
                          const data = new FormData(e.currentTarget);
                          const currentEditorValue = data.get('editor');
                          setResetCounter((prev) => prev + 1);
                          setIsDirty(false);
                          baseToolCodeRef.current =
                            currentEditorValue as string;
                          forceGenerateMetadata.current = true;
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
                                      setToolCode(baseToolCodeRef.current);
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
                          code={toolCode}
                          language="ts"
                          name="editor"
                          onUpdate={(currentCode) => {
                            setIsDirty(currentCode !== baseToolCodeRef.current);
                          }}
                        />
                      </form>
                    )}
                  </div>
                </div>

                <div className="relative flex min-h-[200px] flex-col rounded-lg bg-gray-300 pb-4 pl-4 pr-3">
                  <div className="text-gray-80 flex flex-col gap-1 py-3 text-xs">
                    <h2 className="flex font-mono font-semibold text-gray-50">
                      Run
                    </h2>
                    {metadataGenerationData && (
                      <p>Fill in the options above to run your tool.</p>
                    )}
                  </div>
                  {isMetadataGenerationPending && (
                    <div className="text-gray-80 flex flex-col items-center gap-2 py-4 text-xs">
                      <Loader2 className="shrink-0 animate-spin" />
                      Generating...
                    </div>
                  )}
                  {isMetadataGenerationSuccess && (
                    <div className="text-gray-80 text-xs">
                      <ErrorBoundary
                        FallbackComponent={ToolErrorFallback}
                        onReset={regenerateToolMetadata}
                      >
                        <JsonForm
                          className="py-4"
                          formData={formData}
                          noHtml5Validate={true}
                          onChange={(e) => setFormData(e.formData)}
                          onSubmit={handleRunCode}
                          schema={
                            metadataGenerationData?.parameters as RJSFSchema
                          }
                          uiSchema={{
                            'ui:submitButtonOptions': {
                              props: {
                                disabled: isExecutingCode,
                                isLoading: isExecutingCode,
                              },
                              // @ts-expect-error string type
                              submitText: (
                                <div
                                  className={
                                    'inline-flex items-center justify-center gap-2 pl-2 pr-3'
                                  }
                                >
                                  {!isExecutingCode && (
                                    <Play className="h-4 w-4" />
                                  )}
                                  Run
                                </div>
                              ),
                            },
                          }}
                          validator={validator}
                        />
                      </ErrorBoundary>
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

                <div
                  className="flex min-h-[200px] flex-col rounded-lg bg-gray-300 pb-4 pl-4 pr-3"
                  ref={toolResultBoxRef}
                >
                  <h2 className="flex items-center pb-1 pl-1 pt-3 font-mono text-xs font-semibold text-gray-50">
                    Tool Output
                  </h2>
                  {isExecutingCode && (
                    <div className="text-gray-80 flex flex-col items-center gap-2 py-4 text-xs">
                      <Loader2 className="shrink-0 animate-spin" />
                      Running Tool...
                    </div>
                  )}
                  {isCodeExecutionError && (
                    <div className="text-gray-80 flex flex-col items-center gap-2 py-4 text-xs">
                      <XCircle className="h-6 w-6 text-red-400" />
                      <p>Tool code execution failed.</p>
                      <p>Try generating the tool code again.</p>
                    </div>
                  )}
                  {isCodeExecutionSuccess && toolResult && (
                    <div className="py-2">
                      <JsonView
                        className="rounded-md p-4"
                        displayDataTypes={false}
                        displayObjectSize={false}
                        enableClipboard={false}
                        style={githubDarkTheme}
                        value={toolResult}
                      />
                    </div>
                  )}
                  {isCodeExecutionIdle && (
                    <p className="text-gray-80 py-4 pt-6 text-center text-xs">
                      No tool results yet. <br />
                      {/* eslint-disable-next-line react/no-unescaped-entities */}
                      "Run tool" to see results.
                    </p>
                  )}
                </div>
              </TabsContent>
              <TabsContent
                className="mt-1 h-full space-y-4 overflow-y-auto whitespace-pre-line break-words py-4 pr-3"
                value="preview"
              >
                <div className="flex min-h-[200px] flex-col rounded-lg bg-gray-300 pb-4 pl-4 pr-3">
                  <div className="text-gray-80 flex flex-col gap-1 py-3 text-xs">
                    <h2 className="flex font-mono font-semibold text-gray-50">
                      Metadata
                    </h2>
                    {metadataGenerationData && (
                      <p>Fill in the options above to run your tool.</p>
                    )}
                  </div>
                  {isMetadataGenerationPending && (
                    <div className="text-gray-80 flex flex-col items-center gap-2 py-4 text-xs">
                      <Loader2 className="shrink-0 animate-spin" />
                      Generating Metadata...
                    </div>
                  )}
                  <ErrorBoundary
                    FallbackComponent={ToolErrorFallback}
                    onReset={regenerateToolMetadata}
                  >
                    {isMetadataGenerationSuccess && (
                      <div className="text-gray-80 relative text-xs">
                        {config.isDev && (
                          <div className="absolute -top-8 right-0 flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  className="size-[30px] p-2"
                                  onClick={regenerateToolMetadata}
                                  size="auto"
                                  variant="outline"
                                >
                                  <ReloadIcon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipPortal>
                                <TooltipContent className="flex flex-col items-center gap-1">
                                  <p>Regenerate Metadata</p>
                                </TooltipContent>
                              </TooltipPortal>
                            </Tooltip>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  className="flex h-[30px] items-center gap-1 rounded-md text-xs"
                                  size="auto"
                                  variant="outline"
                                >
                                  <ArrowUpRight className="h-4 w-4" />
                                  Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="flex max-w-5xl flex-col bg-gray-300 p-5 text-xs">
                                <DialogClose className="absolute right-4 top-4">
                                  <XIcon className="text-gray-80 h-5 w-5" />
                                </DialogClose>
                                <DialogHeader className="flex justify-between">
                                  <DialogTitle className="text-left text-sm font-bold">
                                    Details
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-10 space-y-3">
                                  <div className="max-h-[80vh] overflow-y-auto px-5 pb-2 pt-0.5">
                                    <div className="flex h-12 items-center justify-between gap-2 pt-1.5">
                                      <h2 className="text-gray-80 flex items-center pl-1 font-mono text-xs font-semibold">
                                        Response
                                      </h2>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div>
                                            <CopyToClipboardIcon
                                              className="text-gray-80 flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-transparent transition-colors hover:bg-gray-300 hover:text-white [&>svg]:h-3 [&>svg]:w-3"
                                              string={metadataMessageContent}
                                            />
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipPortal>
                                          <TooltipContent className="flex flex-col items-center gap-1">
                                            <p>Copy Code</p>
                                          </TooltipContent>
                                        </TooltipPortal>
                                      </Tooltip>
                                    </div>
                                    <MarkdownPreview
                                      className="prose-h1:!text-gray-50 prose-h1:!text-sm !text-sm !text-gray-50"
                                      source={metadataMessageContent}
                                    />
                                  </div>

                                  <div className="max-h-[80vh] overflow-y-auto px-5 pb-2 pt-0.5">
                                    <div className="text-gray-80 flex-1 items-center gap-1 truncate text-left text-xs">
                                      View JSON
                                    </div>
                                    <JsonView
                                      displayDataTypes={false}
                                      displayObjectSize={false}
                                      enableClipboard={false}
                                      style={githubDarkTheme}
                                      value={metadataGenerationData ?? {}}
                                    />
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}

                        <Form {...metadataForm}>
                          <form
                            className="space-y-4 pb-4 pt-4"
                            onSubmit={metadataForm.handleSubmit(handleSaveTool)}
                          >
                            <div className="space-y-3">
                              <h3 className="text-xs font-medium uppercase text-white">
                                General
                              </h3>

                              <FormField
                                control={metadataForm.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tool Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={metadataForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tool Description</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {Object.keys(
                              metadataGenerationData?.configurations
                                ?.properties ?? {},
                            ).length > 0 && (
                              <div className="space-y-4">
                                <h3 className="text-xs font-medium uppercase text-white">
                                  Tool Config
                                </h3>

                                <JsonForm
                                  className="py-4"
                                  noHtml5Validate={true}
                                  schema={
                                    metadataGenerationData?.configurations as RJSFSchema
                                  }
                                  uiSchema={{
                                    'ui:submitButtonOptions': {
                                      norender: true,
                                    },
                                  }}
                                  validator={validator}
                                />
                              </div>
                            )}
                          </form>
                        </Form>
                      </div>
                    )}
                  </ErrorBoundary>
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

export function ToolSelectionModal() {
  const auth = useAuth((state) => state.auth);

  const { data: toolsList } = useGetTools({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });
  const { mutateAsync: updateTool, isPending } = useUpdateTool();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className={cn(actionButtonClassnames, 'w-[90px]')}
          role="button"
          tabIndex={0}
        >
          Tools{' '}
          {toolsList?.filter((tool) => tool.enabled).length && (
            <Badge className="bg-brand inline-flex h-5 w-5 items-center justify-center rounded-full border-gray-200 p-0 text-center text-gray-50">
              {toolsList?.filter((tool) => tool.enabled).length}
            </Badge>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="flex max-w-xl flex-col bg-gray-300 p-5 text-xs">
        <DialogTitle className="pb-0">Available tools</DialogTitle>
        <DialogDescription>blaalalal</DialogDescription>
        <div className="flex max-h-[28vh] flex-col gap-2.5 overflow-auto">
          <div className="flex items-center gap-3">
            <Switch checked={false} />
            <span className="text-gray-80 text-xs">Enabled All</span>
          </div>
          {toolsList?.map((tool) => (
            <div
              className="flex w-full flex-col gap-3"
              key={tool.tool_router_key}
            >
              <div className="flex items-center gap-3">
                <Switch
                  checked={tool.enabled}
                  disabled={isPending}
                  onCheckedChange={async () => {
                    await updateTool({
                      toolKey: tool.tool_router_key,
                      toolType: tool.tool_type,
                      toolPayload: {} as ShinkaiTool,
                      isToolEnabled: !tool.enabled,
                      nodeAddress: auth?.node_address ?? '',
                      token: auth?.api_v2_key ?? '',
                    });
                  }}
                />

                <div className="space-y-1 leading-none">
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1">
                        <div className="text-gray-80 static space-y-1.5 text-xs">
                          {formatText(tool.name)}
                        </div>
                        <InfoCircleIcon className="h-3 w-3 text-gray-100" />
                      </TooltipTrigger>
                      <TooltipPortal>
                        <TooltipContent
                          align="start"
                          alignOffset={-10}
                          className="max-w-md"
                          side="top"
                        >
                          {tool.description}
                        </TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
