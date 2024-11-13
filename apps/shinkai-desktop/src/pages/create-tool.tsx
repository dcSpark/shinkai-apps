import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useCreateToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolCode/useCreateToolCode';
import {
  Button,
  Form,
  FormField,
  Input,
  MessageList,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TooltipProvider,
} from '@shinkai_network/shinkai-ui';
import { SendIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Play, Save, Share2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { z } from 'zod';

import { useWebSocketMessage } from '../components/chat/websocket-message';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';
import { useChatConversationWithOptimisticUpdates } from './chat/chat-conversation';

export const createToolCodeFormSchema = z.object({
  message: z.string().min(1),
});

export type CreateToolCodeFormSchema = z.infer<typeof createToolCodeFormSchema>;

function CreateToolPage() {
  const [tab, setTab] = useState<'use' | 'build'>('use');
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();

  const [chatInboxId, setChatInboxId] = useState<string | null>(null);
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
  const defaultAgentId = useSettings(
    (settingsStore) => settingsStore.defaultAgentId,
  );
  const { mutateAsync: createToolCode } = useCreateToolCode({
    onSuccess: (data) => {
      setChatInboxId(buildInboxIdFromJobId(data.job_id));
    },
  });

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

  const onSubmit = async (data: CreateToolCodeFormSchema) => {
    if (!auth) return;

    await createToolCode({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      message: data.message,
      llmProviderId: defaultAgentId,
    });
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
                        App.tsx
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
                      }}
                      language={'jsx'}
                      style={oneDark}
                    >
                      codeeeeeeeee
                    </SyntaxHighlighter>
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
