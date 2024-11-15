import { zodResolver } from '@hookform/resolvers/zod';
import { DialogClose } from '@radix-ui/react-dialog';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  buildInboxIdFromJobId,
  extractJobIdFromInbox,
} from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useCreateToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolCode/useCreateToolCode';
import { useCreateToolMetadata } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolMetadata/useCreateToolMetadata';
import { useExecuteToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/executeToolCode/useExecuteToolCode';
import { useSaveToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/saveToolCode/useSaveToolCode';
import {
  Badge,
  Button,
  CopyToClipboardIcon,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormDescription,
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
import { cn } from '@shinkai_network/shinkai-ui/utils';
import JsonView from '@uiw/react-json-view';
import { githubLightTheme } from '@uiw/react-json-view/githubLight';
import { ArrowUpRight, Loader2, Play, Save, XIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { toast } from 'sonner';
import { z } from 'zod';

import config from '../config';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';
import { useChatConversationWithOptimisticUpdates } from './chat/chat-conversation';

export const createToolCodeFormSchema = z.object({
  message: z.string().min(1),
});

const metadataFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  author: z.string().min(1, 'Author is required'),
  keywords: z.array(z.string()),
  configurations: z.record(z.any()),
  parameters: z.record(z.any()),
});
type MetadataFormSchema = z.infer<typeof metadataFormSchema>;

export type CreateToolCodeFormSchema = z.infer<typeof createToolCodeFormSchema>;

type ToolMetadata = {
  id: string;
  name: string;
  description: string;
  author: string;
  keywords: string[];
  configurations: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
  parameters: {
    type: 'object';
    properties: Record<string, any>;

    required: string[];
  };
  result: {
    type: 'object';
    properties: Record<string, any>;
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
      const parsedJson = JSON.parse(jsonCodeMatch[1].trim());
      return parsedJson;
    } catch (error) {
      toast.error('Failed to generate preview (json)', {
        description: (error as Error)?.message,
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
  const navigate = useNavigate();
  const [toolCode, setToolCode] = useState<string>('');
  // ''
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

  const { mutateAsync: saveToolCode } = useSaveToolCode({
    onSuccess: () => {
      toast.success('Tool code saved successfully');
      // TODO: Redirect to the tool page
      navigate('/tools');
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

    if (metadata.role === 'assistant' && metadata.status.type === 'complete') {
      return extractAndParseJsonCode(metadata.content);
    }
    return null;
  }, [metadataData?.pages]);

  const metadataForm = useForm<MetadataFormSchema>({
    resolver: zodResolver(metadataFormSchema),
    defaultValues: {
      name: metadataValue?.name,
      description: metadataValue?.description,
      author: metadataValue?.author,
      keywords: metadataValue?.keywords ?? [],
      configurations: Object.keys(
        metadataValue?.configurations?.properties ?? {},
      ).reduce(
        (acc, key) => ({
          ...acc,
          [key]: metadataValue?.configurations.properties[key] || '',
        }),
        {},
      ),
      parameters: Object.keys(
        metadataValue?.parameters?.properties ?? {},
      ).reduce(
        (acc, key) => ({
          ...acc,
          [key]: metadataValue?.parameters.properties[key] || '',
        }),
        {},
      ),
    },
  });

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
      setToolCode(extractTypeScriptCode(lastMessage?.content) ?? '');
      setTimeout(() => {
        setTab('preview');
      }, 2000);
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
  const handleSubmit = async (data: MetadataFormSchema) => {
    setTab('code');
    await executeCode({
      code: toolCode,
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      params: Object.keys(data.parameters.properties).map((property) => ({
        [property]: data.parameters.properties[property].value,
      })),
    });
  };

  return (
    <TooltipProvider>
      <div className="flex h-full">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel className="flex h-full flex-col px-3 py-4 pt-6">
            <h1 className="py-2 text-lg font-semibold tracking-tight">
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
              <div
                className={'flex h-screen flex-grow justify-stretch p-3 pr-0'}
              >
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
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        className="text-gray-80 h-[30px] rounded-md text-xs"
                        disabled={
                          !toolCode ||
                          !metadataValue ||
                          !isCodeExecutionSuccess ||
                          !chatInboxId
                        }
                        onClick={async () => {
                          if (!chatInboxId || !metadataValue) return;

                          await saveToolCode({
                            code: toolCode,
                            metadata: metadataValue,
                            jobId: extractJobIdFromInbox(chatInboxId),
                            token: auth?.api_v2_key ?? '',
                            nodeAddress: auth?.node_address ?? '',
                          });
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button
                        className="h-[30px] rounded-md text-xs"
                        disabled={!toolCode || !metadataValue}
                        isLoading={isExecutingCode}
                        onClick={() => {
                          metadataForm.handleSubmit(handleSubmit)();
                        }}
                        size="sm"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Run tool
                      </Button>
                    </div>
                  </div>

                  <TabsContent
                    className="mt-1 h-full space-y-4 overflow-y-auto whitespace-pre-line break-words py-4 pr-3"
                    value="code"
                  >
                    <div className="flex min-h-[250px] flex-col rounded-lg bg-gray-300 pb-4 pl-4 pr-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-gray-80 flex flex-col gap-1 py-3 text-xs">
                          <h2 className="flex font-mono font-semibold text-gray-50">
                            Code
                          </h2>
                          {toolCode && (
                            <p>
                              {/* eslint-disable-next-line react/no-unescaped-entities */}
                              Here's the code generated by Shinkai AI based on
                              your prompt.
                            </p>
                          )}
                        </div>
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
                        )}
                      </div>
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
                  <TabsContent
                    className="mt-1 h-full space-y-4 overflow-y-auto whitespace-pre-line break-words py-4 pr-3"
                    value="preview"
                  >
                    <div className="flex min-h-[200px] flex-col rounded-lg bg-gray-300 pb-4 pl-4 pr-3">
                      <div className="text-gray-80 flex flex-col gap-1 py-3 text-xs">
                        <h2 className="flex font-mono font-semibold text-gray-50">
                          Preview
                        </h2>
                        {metadataValue && (
                          <p>Fill in the options above to run your tool.</p>
                        )}
                      </div>
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
                            <div className="text-gray-80 relative text-xs">
                              {config.isDev && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      className="absolute -top-8 right-0 flex h-[30px] items-center gap-1 rounded-md text-xs"
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
                                                  string={
                                                    metadata.content ?? ''
                                                  }
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
                                      </div>

                                      <div className="max-h-[80vh] overflow-y-auto px-5 pb-2 pt-0.5">
                                        <div className="text-gray-80 flex-1 items-center gap-1 truncate text-left text-xs">
                                          View JSON
                                        </div>
                                        <JsonView
                                          displayDataTypes={false}
                                          displayObjectSize={false}
                                          enableClipboard={false}
                                          style={githubLightTheme}
                                          value={metadataValue ?? {}}
                                        />
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}

                              <Form {...metadataForm}>
                                <form
                                  className="space-y-4 pb-4 pt-4"
                                  onSubmit={metadataForm.handleSubmit(
                                    handleSubmit,
                                  )}
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
                                    metadataValue?.configurations?.properties ??
                                      {},
                                  ).length > 0 && (
                                    <div className="space-y-4">
                                      <h3 className="text-xs font-medium uppercase text-white">
                                        Tool Config
                                      </h3>
                                      {Object.entries(
                                        metadataValue?.configurations
                                          ?.properties ?? {},
                                      ).map(([key, prop]) => (
                                        <FormField
                                          control={metadataForm.control}
                                          key={key}
                                          name={`configurations.properties.${key}.value`}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>{key}</FormLabel>
                                              <FormControl>
                                                <PropertyInput
                                                  field={field}
                                                  property={prop}
                                                />
                                              </FormControl>
                                              <FormDescription>
                                                {prop.type === 'array'
                                                  ? `Enter ${key} (comma-separated ${prop.items?.type || 'values'})`
                                                  : `Type: ${prop.type}`}
                                              </FormDescription>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      ))}
                                    </div>
                                  )}

                                  {Object.keys(
                                    metadataValue?.parameters?.properties ?? {},
                                  ).length > 0 && (
                                    <div className="space-y-4">
                                      <h3 className="text-xs font-medium uppercase text-white">
                                        Inputs
                                      </h3>

                                      {Object.entries(
                                        metadataValue?.parameters?.properties ??
                                          {},
                                      ).map(([key, prop]) => (
                                        <FormField
                                          control={metadataForm.control}
                                          key={key}
                                          name={`parameters.properties.${key}.value`}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel className="capitalize">
                                                {key.replace(/_/g, ' ')}
                                                {metadataValue?.parameters?.required?.includes(
                                                  key,
                                                ) && (
                                                  <span className="ml-1 text-gray-100">
                                                    (required)
                                                  </span>
                                                )}
                                              </FormLabel>
                                              <FormControl>
                                                <PropertyInput
                                                  field={field}
                                                  property={prop}
                                                />
                                              </FormControl>
                                              <FormDescription>
                                                {prop.type === 'array'
                                                  ? `Enter ${key} (comma-separated ${prop.items?.type || 'values'})`
                                                  : `Type: ${prop.type}`}
                                              </FormDescription>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </form>
                              </Form>
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

function PropertyInput({
  property,
  field,
}: {
  property: { type: string; items?: { type: string } };
  field: any;
}) {
  switch (property.type) {
    case 'boolean':
      return <Switch checked={field.value} onCheckedChange={field.onChange} />;

    case 'number':
      return (
        <Input
          {...field}
          onChange={(e) => field.onChange(Number(e.target.value))}
          type="number"
        />
      );

    case 'array':
      return (
        <Input
          {...field}
          onChange={(e) => {
            const values = e.target.value.split(',').map((item) => item.trim());
            field.onChange(values);
          }}
          placeholder="Enter values separated by commas"
          value={
            Array.isArray(field.value) ? field.value.join(', ') : field.value
          }
        />
      );

    default:
      return <Input {...field} />;
  }
}
