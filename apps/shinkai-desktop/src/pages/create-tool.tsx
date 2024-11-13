import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useCreateToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolCode/useCreateToolCode';
import { useCreateToolMetadata } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolMetadata/useCreateToolMetadata';
import { useExecuteToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/executeToolCode/useExecuteToolCode';
import {
  Button,
  Form,
  FormField,
  Input,
  MessageList,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TooltipProvider,
} from '@shinkai_network/shinkai-ui';
import { SendIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import JsonView from '@uiw/react-json-view';
import { githubLightTheme } from '@uiw/react-json-view/githubLight';
import { Play, Save, Share2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { toast } from 'sonner';
import { z } from 'zod';

import { useWebSocketMessage } from '../components/chat/websocket-message';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';
import { useChatConversationWithOptimisticUpdates } from './chat/chat-conversation';
export const createToolCodeFormSchema = z.object({
  message: z.string().min(1),
});

export type CreateToolCodeFormSchema = z.infer<typeof createToolCodeFormSchema>;

function extractAllTypeScriptCode(message: string): string[] {
  const codeBlocks: string[] = [];
  const codeRegex = /```typescript\\n([\s\S]*?)\\n```/g;
  let match;

  while ((match = codeRegex.exec(message)) !== null) {
    codeBlocks.push(match[1].replace(/\\n/g, '\n'));
  }

  return codeBlocks;
}

function parseJSONMarkdownToObject(message: string): object | null {
  const codeBlockRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = message.match(codeBlockRegex);

  if (!match) {
    return null;
  }

  let jsonLikeString = match[1];

  // Remove the trailing semicolon if present
  jsonLikeString = jsonLikeString.replace(/;\s*$/, '');

  // Replace single quotes with double quotes
  jsonLikeString = jsonLikeString.replace(/'/g, '"');

  // Remove trailing commas before closing braces or brackets
  jsonLikeString = jsonLikeString.replace(/,\s*(\}|\])/g, '$1');

  // Add double quotes around unquoted keys
  jsonLikeString = jsonLikeString.replace(
    /(\s*)([a-zA-Z0-9_]+)\s*:/g,
    '$1"$2":',
  );

  // Fix arrays containing objects with single key-value pairs (e.g., [{'url'}] to ["url"])
  jsonLikeString = jsonLikeString.replace(
    /\[\s*\{\s*"([^"]+)"\s*\}\s*\]/g,
    '["$1"]',
  );

  // Parse the cleaned string into a JavaScript object
  try {
    return JSON.parse(jsonLikeString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}

function CreateToolPage() {
  const [tab, setTab] = useState<'use' | 'build'>('build');
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();

  const [toolCode, setToolCode] = useState<string>('');
  const [toolResult, setToolResult] = useState<object | null>(null);

  const [chatInboxId, setChatInboxId] = useState<string | null>(null);
  const [chatInboxIdMetadata, setChatInboxIdMetadata] = useState<string | null>(
    null,
  );
  // useWebSocketMessage({
  //   inboxId: chatInboxId ?? '',
  //   enabled: true,
  // });

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
  const {
    data: metadataData,
    // fetchPreviousPage,
    // hasPreviousPage,
    // isChatConversationLoading,
    // isFetchingPreviousPage,
    // isChatConversationSuccess,
  } = useChatConversationWithOptimisticUpdates({
    inboxId: chatInboxIdMetadata ?? '',
    forceRefetchInterval: true,
  });

  const { mutateAsync: createToolMetadata } = useCreateToolMetadata();
  const { mutateAsync: executeCode, isPending: isExecutingCode } =
    useExecuteToolCode({
      onSuccess: (data) => {
        setToolResult(data);
      },
    });
  const defaultAgentId = useSettings(
    (settingsStore) => settingsStore.defaultAgentId,
  );
  const { mutateAsync: createToolCode } = useCreateToolCode();

  const metadata = metadataData?.pages?.at(-1)?.at(-1);

  const metadataContent = useMemo(() => {
    const metadata = metadataData?.pages?.at(-1)?.at(-1);

    if (!metadata) return null;
    return parseJSONMarkdownToObject(metadata.content);
  }, [metadataData?.pages]);

  // useEffect(() => {
  //   const lastMessage = data?.pages?.at(-1)?.at(-1);
  //
  //   if (
  //     lastMessage?.role === 'assistant' &&
  //     lastMessage?.status.type !== 'running'
  //   ) {
  //     setToolCode(extractTypeScriptCode(lastMessage?.content) ?? '');
  //   }
  // }, [data?.pages]);

  useWebSocketMessage({
    inboxId: chatInboxId ?? '',
    enabled: true,
  });

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
            toast.success('metadata generated!', { description: data.job_id });
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

  useEffect(() => {
    const message = ` Based on the rules provided, I will implement the task as follows:\\n\\n**Implementation File:**\\n\`\`\`typescript\\n// Import axios library\\nimport { fetch } from 'npm:axios';\\n\\n// Define CONFIG type\\ninterface Config {\\n  timeout?: number;\\n}\\n\\n// Define INPUTS type\\ninterface Inputs {\\n  url: string;\\n}\\n\\n// Define OUTPUT type\\ninterface Output {\\n  text: string;\\n}\\n\\n// Run function signature\\nasync function run(config: Config, inputs: Inputs): Promise<Output> {\\n  // Implement the logic here\\n}\\n\\nexport { run };\\n\`\`\`\\n\\n**Implementation of \`run\` function:**\\n\`\`\`typescript\\nimport { fetch } from 'npm:axios';\\n\\ninterface Config {\\n  timeout?: number;\\n}\\n\\ninterface Inputs {\\n  url: string;\\n}\\n\\ninterface Output {\\n  text: string;\\n}\\n\\nasync function run(config: Config, inputs: Inputs): Promise<Output> {\\n  const { url } = inputs;\\n\\n  try {\\n    // Send a GET request to the URL\\n    const response = await fetch.get(url);\\n\\n    // Check if the response was successful\\n    if (response.status === 200) {\\n      // Get the HTML content of the page\\n      const html = response.data;\\n\\n      // Use a library like cheerio to parse the HTML and extract text\\n      const cheerio = await import('npm:cheerio');\\n      const $ = cheerio.load(html);\\n      const text = $.text();\\n\\n      // Return the extracted text as plain text\\n      return { text };\\n    } else {\\n      throw new Error(\`Failed to retrieve page. Status code: \${response.status}\`);\\n    }\\n  } catch (error) {\\n    console.error(error);\\n    throw error;\\n  }\\n}\\n\\nexport { run };\\n\`\`\`\\n\\nNote that I used the \`npm:\` prefix to import the required libraries (\`axios\` and \`cheerio\`). I also assumed that you want to use \`cheerio\` to parse the HTML content of the page. You may need to adjust this depending on your specific requirements.\\n\\nPlease let me know if you have any further questions or if there's anything else I can help with!`;
    setToolCode(extractAllTypeScriptCode(message)?.[1] ?? '');
  }, []);

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
        },
      },
    );
    form.reset();
    return;
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
                    Generate a tool using Shinkai AI
                  </h2>
                  <p className="text-gray-80 text-xs">
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    "Generate a tool that downloads https://jhftss.github.io/{' '}
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    and convert to plain text", “Generate a tool that downloads{' '}
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    https://jhftss.github.io/ and convert to plain text'
                  </p>
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
              onValueChange={(value) => setTab(value as 'use' | 'build')}
              value={tab}
            >
              <div className={'flex h-screen flex-grow justify-stretch p-3'}>
                <div className="flex size-full flex-col overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <TabsList className="grid grid-cols-2 rounded-lg border border-gray-400 bg-transparent p-0.5">
                      <TabsTrigger
                        className="flex h-8 items-center gap-1.5 text-xs font-semibold"
                        value="build"
                      >
                        Build
                      </TabsTrigger>
                      <TabsTrigger
                        className="flex h-8 items-center gap-1.5 text-xs font-semibold"
                        value="use"
                      >
                        Use
                      </TabsTrigger>
                    </TabsList>
                    {tab === 'build' && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          className="text-gray-80 h-[30px] rounded-md text-xs"
                          size="sm"
                          variant="outline"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button
                          className="h-[30px] rounded-md text-xs"
                          onClick={() =>
                            executeCode({
                              nodeAddress: auth?.node_address ?? '',
                              token: auth?.api_v2_key ?? '',
                              params: {},
                              toolType: '',
                              toolRouterKey: '',
                            })
                          }
                          size="sm"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Run tool
                        </Button>
                      </div>
                    )}
                    {tab === 'use' && (
                      <div className="">
                        <Button
                          className="text-gray-80 h-[30px] rounded-md text-xs"
                          size="sm"
                          variant="outline"
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    )}
                  </div>

                  <TabsContent
                    className="mt-1 h-full overflow-y-auto whitespace-pre-line break-words px-4 py-2 font-mono"
                    value="build"
                  >
                    <div className="flex h-10 items-center justify-between gap-3 rounded-t-lg bg-gray-300 pl-4 pr-3">
                      {/* by default App.tsx */}
                      <h2 className="text-gray-80 text-xs font-semibold">
                        Code
                      </h2>
                    </div>
                    <SyntaxHighlighter
                      PreTag="div"
                      codeTagProps={{ style: { fontSize: '0.8rem' } }}
                      customStyle={{
                        margin: 0,
                        width: '100%',
                        padding: '0.5rem 1rem',
                        borderRadius: 0,
                        maxHeight: '30vh',
                      }}
                      language={'typescript'}
                      style={oneDark}
                    >
                      {toolCode}
                    </SyntaxHighlighter>
                    <Separator className="my-6" />
                    <div className="flex h-10 items-center justify-between gap-3 rounded-t-lg bg-gray-300 pl-4 pr-3">
                      {/* by default App.tsx */}
                      <h2 className="text-gray-80 text-xs font-semibold">
                        Metadata
                      </h2>
                      <div>
                        {metadata?.role === 'assistant' &&
                          metadata?.status.type === 'running' && (
                            <div className="text-gray-80 text-xs">
                              Running...
                            </div>
                          )}
                      </div>
                    </div>
                    <div>
                      {metadata?.role === 'assistant' && (
                        <div className="text-gray-80 text-xs">
                          <JsonView
                            displayDataTypes={false}
                            displayObjectSize={false}
                            enableClipboard={false}
                            style={githubLightTheme}
                            value={metadataContent ?? {}}
                          />
                        </div>
                      )}
                    </div>
                    <Separator className="my-6" />
                    <div className="flex h-10 items-center justify-between gap-3 rounded-t-lg bg-gray-300 pl-4 pr-3">
                      {/* by default App.tsx */}
                      <h2 className="text-gray-80 text-xs font-semibold">
                        Tool Output
                      </h2>
                      <div>
                        {isExecutingCode && (
                          <div className="text-gray-80 text-xs">
                            Running tool...
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      {toolResult && (
                        <JsonView
                          displayDataTypes={false}
                          displayObjectSize={false}
                          enableClipboard={false}
                          style={githubLightTheme}
                          value={toolResult}
                        />
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent
                    className="h-full w-full flex-grow px-4 py-2"
                    value="use"
                  >
                    <div className="size-full">Preview</div>
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
