import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useCreateToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolCode/useCreateToolCode';
import { useCreateToolMetadata } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolMetadata/useCreateToolMetadata';
import { useExecuteToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/executeToolCode/useExecuteToolCode';
import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  CopyToClipboardIcon,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  MarkdownPreview,
  MessageList,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
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
import { cn } from '@shinkai_network/shinkai-ui/utils';
import JsonView from '@uiw/react-json-view';
import { githubLightTheme } from '@uiw/react-json-view/githubLight';
import { ArrowUpRight, ChevronRight, Loader2, Play, Save } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useForm } from 'react-hook-form';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { toast } from 'sonner';
import { z } from 'zod';

// import { useWebSocketMessage } from '../components/chat/websocket-message';
import config from '../config';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';
import { useChatConversationWithOptimisticUpdates } from './chat/chat-conversation';

export const createToolCodeFormSchema = z.object({
  message: z.string().min(1),
});

export type CreateToolCodeFormSchema = z.infer<typeof createToolCodeFormSchema>;

type ToolMetadata = {
  id: string;
  name: string;
  description: string;
  author: string;
  keywords: string[];
  configurations: {
    type: 'object';
    properties: Record<string, { type: string }>;
    required: string[];
  };
  parameters: {
    type: 'object';
    properties: Record<string, { type: string }>;

    required: string[];
  };
  result: {
    type: 'object';
    properties: Record<string, { type: string; items: any }>;
    required: string[];
  };
};

function ToolErrorFallback({ error }: { error: Error }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-8 text-xs text-red-400"
      role="alert"
    >
      <p>Something went wrong. Try refreshing the app.</p>
      <pre className="mb-4 whitespace-pre-wrap text-balance break-all text-center">
        {error.message}
      </pre>
      <Button
        className="h-[30px]"
        onClick={() => window.location.reload()}
        size="auto"
        variant="outline"
      >
        Try again
      </Button>
    </div>
  );
}

function extractTypeScriptCode(message: string) {
  const tsCodeMatch = message.match(/```typescript\n([\s\S]*?)\n```/);
  return tsCodeMatch ? tsCodeMatch[1].trim() : null;
}

function extractAndParseJsonCode(message: string): ToolMetadata | null {
  const jsonCodeMatch = message.match(/```json\n([\s\S]*?)\n```/);
  if (jsonCodeMatch) {
    try {
      return JSON.parse(jsonCodeMatch[1].trim());
    } catch (error) {
      toast.error('Failed to generate preview (json): ' + error, {
        description: jsonCodeMatch,
      });
      return null;
    }
  }
  return null;
}

function CreateToolPage() {
  const [tab, setTab] = useState<'code' | 'preview'>('code');
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();
  const toolResultBoxRef = useRef<HTMLDivElement>(null);
  const [toolCode, setToolCode] = useState<string>('');
  const [toolResult, setToolResult] = useState<object | null>(null);
  const [chatInboxId, setChatInboxId] = useState<string | null>(null);
  const [chatInboxIdMetadata, setChatInboxIdMetadata] = useState<string | null>(
    null,
  );

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
      });
    },
  });
  const defaultAgentId = useSettings(
    (settingsStore) => settingsStore.defaultAgentId,
  );
  const { mutateAsync: createToolCode } = useCreateToolCode();

  const metadata = metadataData?.pages?.at(-1)?.at(-1);

  const metadataValue = useMemo(() => {
    const metadata = metadataData?.pages?.at(-1)?.at(-1);
    if (!metadata) return null;
    return extractAndParseJsonCode(metadata.content);
  }, [metadataData?.pages]);

  const paramsForm = useForm({
    defaultValues: Object.keys(
      metadataValue?.parameters?.properties || {},
    ).reduce((acc: Record<string, any>, key) => {
      const type = metadataValue?.parameters.properties[key].type;
      acc[key] = type === 'array' ? [] : type === 'string' ? '' : null;
      return acc;
    }, {}),
  });

  useEffect(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    if (
      lastMessage?.role === 'assistant' &&
      lastMessage?.status.type === 'complete'
    ) {
      setToolCode(extractTypeScriptCode(lastMessage?.content) ?? '');
      setTimeout(() => {
        setTab('preview');
      }, 1800);
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
    if (!toolCode) return;
    const run = async () => {
      await createToolMetadata(
        {
          nodeAddress: auth?.node_address ?? '',
          token: auth?.api_v2_key ?? '',
          message: '',
          llmProviderId: defaultAgentId,
          code: toolCode,
        },
        {
          onSuccess: (data) => {
            setChatInboxIdMetadata(buildInboxIdFromJobId(data.job_id));
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

    await createToolCode(
      {
        nodeAddress: auth.node_address,
        token: auth.api_v2_key,
        message: data.message,
        llmProviderId: defaultAgentId,
      },
      {
        onSuccess: (data) => {
          setChatInboxId(buildInboxIdFromJobId(data.job_id));
          setTab('code');
          setToolCode('');
          setToolResult(null);
        },
      },
    );
    form.reset();
    return;
  };
  const handleSubmit = async (data: Record<string, any>) => {
    await executeCode({
      code: toolCode,
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      params: data,
    });
  };

  return (
    <TooltipProvider>
      <div className="flex h-full">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel className="flex h-full flex-col px-3 py-4 pt-6">
            <h1 className="text-xl font-semibold tracking-tight">
              Create Tool
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
                className="space-y-2"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="flex shrink-0 items-center gap-1">
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <Input
                        autoFocus
                        className="placeholder-gray-80 !h-[50px] flex-1 bg-gray-200 px-3 py-2"
                        disabled={isLoadingMessage}
                        onChange={field.onChange}
                        placeholder={'Ask Shinkai AI'}
                        value={field.value}
                      />
                    )}
                  />

                  <Button
                    className="aspect-square h-[90%] shrink-0 rounded-lg p-2"
                    disabled={isLoadingMessage}
                    size="auto"
                    type="submit"
                    variant="default"
                  >
                    <SendIcon className="h-4.5 w-4.5" />
                  </Button>
                </div>
              </form>
            </Form>
          </ResizablePanel>
          <ResizableHandle className="bg-gray-300" />
          <ResizablePanel
            className="flex h-full flex-col px-3 py-4 pt-6"
            collapsible
            defaultSize={70}
            maxSize={70}
            minSize={40}
          >
            <Tabs
              className="flex h-screen w-full flex-col overflow-hidden"
              onValueChange={(value) => setTab(value as 'preview' | 'code')}
              value={tab}
            >
              <div className={'flex h-screen flex-grow justify-stretch p-3'}>
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
                        Preview
                      </TabsTrigger>
                    </TabsList>
                    {/*{tab === 'code' && (*/}
                    <div className="grid gap-2">
                      <Button
                        className="text-gray-80 h-[30px] rounded-md text-xs"
                        disabled={!toolCode || !metadataValue}
                        size="sm"
                        variant="outline"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      {/*<Button*/}
                      {/*  className="h-[30px] rounded-md text-xs"*/}
                      {/*  disabled={!toolCode}*/}
                      {/*  // onClick={() =>*/}
                      {/*  // executeCode({*/}
                      {/*  //   nodeAddress: auth?.node_address ?? '',*/}
                      {/*  //   token: auth?.api_v2_key ?? '',*/}
                      {/*  //   params: {},*/}
                      {/*  //   toolType: '',*/}
                      {/*  //   toolRouterKey: '',*/}
                      {/*  // })*/}

                      {/*  size="sm"*/}
                      {/*>*/}
                      {/*  <Play className="mr-2 h-4 w-4" />*/}
                      {/*  Run tool*/}
                      {/*</Button>*/}
                    </div>
                    {/*)}*/}
                    {/*{tab === 'preview' && (*/}
                    {/*  <div className="">*/}
                    {/*    <Button*/}
                    {/*      className="text-gray-80 h-[30px] rounded-md text-xs"*/}
                    {/*      size="sm"*/}
                    {/*      variant="outline"*/}
                    {/*    >*/}
                    {/*      <Share2 className="mr-2 h-4 w-4" />*/}
                    {/*      Share*/}
                    {/*    </Button>*/}
                    {/*  </div>*/}
                    {/*)}*/}
                  </div>

                  <TabsContent
                    className="mt-1 h-full space-y-4 overflow-y-auto whitespace-pre-line break-words py-4"
                    value="code"
                  >
                    <div className="flex min-h-[400px] flex-col rounded-lg bg-gray-300 pb-4 pl-4 pr-3">
                      <div className="flex h-12 items-center justify-between gap-2 pt-1.5">
                        <h2 className="text-gray-80 flex items-center pl-1 font-mono text-xs font-semibold">
                          Generated Code
                        </h2>
                        {toolCode && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <CopyToClipboardIcon
                                  className="text-gray-80 flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-transparent transition-colors hover:bg-gray-300 hover:text-white [&>svg]:h-3 [&>svg]:w-3"
                                  string={toolCode ?? ''}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipPortal>
                              <TooltipContent className="flex flex-col items-center gap-1">
                                <p>Copy Code</p>
                              </TooltipContent>
                            </TooltipPortal>
                          </Tooltip>
                        )}
                      </div>
                      <div className="size-full">
                        {toolCode ? (
                          <SyntaxHighlighter
                            PreTag="div"
                            codeTagProps={{ style: { fontSize: '0.8rem' } }}
                            customStyle={{
                              margin: 0,
                              width: '100%',
                              padding: '0.5rem 1rem',
                              borderRadius: 0,
                              maxHeight: '70vh',
                            }}
                            language={'typescript'}
                            style={oneDark}
                          >
                            {toolCode}
                          </SyntaxHighlighter>
                        ) : (
                          <p className="text-gray-80 pt-6 text-center text-xs">
                            No code generated yet. <br />
                            Ask Shinkai AI to generate your tool code.
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent
                    className="mt-1 h-full space-y-4 overflow-y-auto whitespace-pre-line break-words py-4"
                    value="preview"
                  >
                    <div className="flex min-h-[400px] flex-col rounded-lg bg-gray-300 pb-4 pl-4 pr-3">
                      <h2 className="text-gray-80 flex h-10 items-center pl-1 pt-1.5 font-mono text-xs font-semibold">
                        Preview
                      </h2>
                      {metadata?.role === 'assistant' &&
                        metadata?.status.type === 'running' && (
                          <div className="text-gray-80 flex flex-col items-center gap-2 py-4 text-xs">
                            <Loader2 className="shrink-0 animate-spin" />
                            Generating Preview...
                          </div>
                        )}
                      <ErrorBoundary FallbackComponent={ToolErrorFallback}>
                        {metadata?.role === 'assistant' &&
                          metadata?.status.type === 'complete' && (
                            <div className="text-gray-80 text-xs">
                              {config.isDev && (
                                <Collapsible className="border-b border-gray-200 bg-gray-500">
                                  <CollapsibleTrigger
                                    className={cn(
                                      'flex w-full max-w-full items-center justify-between gap-6 px-5 py-2',
                                    )}
                                  >
                                    <span className="text-gray-80 flex-1 items-center gap-1 truncate text-left text-xs">
                                      Full response
                                    </span>

                                    <ChevronRight className="text-gray-80 h-4 w-4 shrink-0" />
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="max-h-[150px] overflow-y-auto px-5 pb-2 pt-0.5">
                                    <div className="flex h-12 items-center justify-between gap-2 pt-1.5">
                                      <h2 className="text-gray-80 flex items-center pl-1 font-mono text-xs font-semibold">
                                        Response
                                      </h2>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div>
                                            <CopyToClipboardIcon
                                              className="text-gray-80 flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-transparent transition-colors hover:bg-gray-300 hover:text-white [&>svg]:h-3 [&>svg]:w-3"
                                              string={metadata.content ?? ''}
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
                                      source={metadata.content}
                                    />
                                  </CollapsibleContent>
                                </Collapsible>
                              )}
                              {config.isDev && (
                                <Collapsible className="border-b border-gray-200 bg-gray-500">
                                  <CollapsibleTrigger
                                    className={cn(
                                      'flex w-full max-w-full items-center justify-between gap-6 px-5 py-2',
                                    )}
                                  >
                                    <span className="text-gray-80 flex-1 items-center gap-1 truncate text-left text-xs">
                                      View JSON
                                    </span>
                                    <ChevronRight className="text-gray-80 h-4 w-4 shrink-0" />
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="max-h-[150px] overflow-y-auto px-5 pb-2 pt-0.5">
                                    <JsonView
                                      displayDataTypes={false}
                                      displayObjectSize={false}
                                      enableClipboard={false}
                                      style={githubLightTheme}
                                      value={metadataValue ?? {}}
                                    />
                                  </CollapsibleContent>
                                </Collapsible>
                              )}

                              {metadataValue && (
                                <Form {...paramsForm}>
                                  <form
                                    className="space-y-4 py-4"
                                    onSubmit={paramsForm.handleSubmit(
                                      handleSubmit,
                                    )}
                                  >
                                    {Object.entries(
                                      metadataValue.parameters.properties,
                                    ).map(([key, value]) => (
                                      <FormField
                                        control={paramsForm.control}
                                        key={key}
                                        name={key as never}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="capitalize">
                                              {key.replace(/_/g, ' ')}
                                              {metadataValue.parameters.required?.includes(
                                                key,
                                              ) && (
                                                <span className="ml-1 text-gray-100">
                                                  (required)
                                                </span>
                                              )}
                                            </FormLabel>
                                            <FormControl>
                                              {value.type === 'array' ? (
                                                <Input
                                                  {...field}
                                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                                  onChange={(e) =>
                                                    field.onChange(
                                                      e.target.value.split(','),
                                                    )
                                                  }
                                                  placeholder={`Enter multiple values for ${key} separated by commas`}
                                                  type="text"
                                                />
                                              ) : (
                                                <Input
                                                  {...field}
                                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                                  placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                                                  type="text"
                                                />
                                              )}
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    ))}
                                    <Button
                                      className="flex h-[30px] w-full justify-center rounded-md text-xs"
                                      disabled={isExecutingCode}
                                      isLoading={isExecutingCode}
                                      size="sm"
                                      type="submit"
                                    >
                                      <Play className="mr-2 h-4 w-4" />
                                      Run tool
                                    </Button>
                                  </form>
                                </Form>
                              )}
                            </div>
                          )}
                      </ErrorBoundary>
                      {metadata == null && (
                        <div>
                          <p className="text-gray-80 py-4 pt-6 text-center text-xs">
                            No preview generated yet.
                          </p>
                        </div>
                      )}
                    </div>
                    <div
                      className="flex min-h-[400px] flex-col rounded-lg bg-gray-300 pb-4 pl-4 pr-3"
                      ref={toolResultBoxRef}
                    >
                      <h2 className="text-gray-80 flex h-10 items-center pl-1 pt-1.5 font-mono text-xs font-semibold">
                        Tool Output
                      </h2>
                      {isExecutingCode && (
                        <div className="text-gray-80 flex flex-col items-center gap-2 py-4 text-xs">
                          <Loader2 className="shrink-0 animate-spin" />
                          Running Tool...
                        </div>
                      )}
                      {isCodeExecutionSuccess && toolResult && (
                        <div className="py-2">
                          <JsonView
                            displayDataTypes={false}
                            displayObjectSize={false}
                            enableClipboard={false}
                            style={githubLightTheme}
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
                </div>
              </div>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  );
}

export default CreateToolPage;
