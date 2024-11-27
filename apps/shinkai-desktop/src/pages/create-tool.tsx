import { zodResolver } from '@hookform/resolvers/zod';
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
import { ChatConversationInfiniteData } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/types';
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import {
  Badge,
  Button,
  ChatInputArea,
  Dialog,
  DialogContent,
  // DialogDescription,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  JsonForm,
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
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Loader2, Play, Save } from 'lucide-react';
import { InfoCircleIcon } from 'primereact/icons/infocircle';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { AIModelSelector } from '../components/chat/chat-action-bar/ai-update-selection-action-bar';
import { actionButtonClassnames } from '../components/chat/conversation-footer';
import { ToolErrorFallback } from '../components/playground-tool/error-boundary';
import PlaygroundToolLayout from '../components/playground-tool/layout';
import { ToolMetadataSchema } from '../components/playground-tool/schemas';
import ToolCodeEditor from '../components/playground-tool/tool-code-editor';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';
import { useChatConversationWithOptimisticUpdates } from './chat/chat-conversation';

export const createToolCodeFormSchema = z.object({
  message: z.string().min(1),
  llmProviderId: z.string().min(1),
});

export type CreateToolCodeFormSchema = z.infer<typeof createToolCodeFormSchema>;

function extractTypeScriptCode(message: string) {
  const tsCodeMatch = message.match(/```typescript\n([\s\S]*?)\n```/);
  return tsCodeMatch ? tsCodeMatch[1].trim() : null;
}

const useToolMetadata = ({
  chatInboxIdMetadata,
}: {
  chatInboxIdMetadata?: string;
}) => {
  const forceGenerateMetadata = useRef(false);

  const { data: metadataData } = useChatConversationWithOptimisticUpdates({
    inboxId: chatInboxIdMetadata ?? '',
    forceRefetchInterval: true,
  });

  const {
    isMetadataGenerationPending,
    isMetadataGenerationSuccess,
    isMetadataGenerationIdle,
    metadataGenerationData,
    metadataGenerationError,
    isMetadataGenerationError,
  } = useMemo(() => {
    const metadata = metadataData?.pages?.at(-1)?.at(-1);
    const isMetadataGenerationIdle = metadata == null;
    const isMetadataGenerationPending =
      metadata?.role === 'assistant' && metadata?.status.type === 'running';
    const isMetadataGenerationSuccess =
      metadata?.role === 'assistant' && metadata?.status.type === 'complete';
    let metadataGenerationData = null;
    let metadataGenerationError: null | string = null;
    if (isMetadataGenerationSuccess) {
      const jsonCodeMatch = metadata.content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonCodeMatch) {
        try {
          const parsedJson = JSON.parse(jsonCodeMatch[1].trim());
          metadataGenerationData = ToolMetadataSchema.parse(
            parsedJson,
          ) as ToolMetadata;
        } catch (error) {
          if (error instanceof Error) {
            metadataGenerationError = 'Invalid Metadata: ' + error.message;
          }
          if (error instanceof z.ZodError) {
            metadataGenerationError =
              'Invalid Metadata: ' +
              error.issues.map((issue) => issue.message).join(', ');
          }
        }
      } else {
        metadataGenerationError = 'No JSON code found';
      }
    }

    return {
      metadataMessageContent: metadata?.content,
      isMetadataGenerationPending,
      isMetadataGenerationSuccess,
      isMetadataGenerationIdle,
      metadataGenerationData,
      isMetadataGenerationError: metadataGenerationError != null,
      metadataGenerationError,
    };
  }, [metadataData?.pages]);

  return {
    isMetadataGenerationPending,
    isMetadataGenerationSuccess,
    isMetadataGenerationIdle,
    metadataGenerationData,
    metadataGenerationError,
    isMetadataGenerationError,
    forceGenerateMetadata,
  };
};

function CreateToolPage() {
  const [tab, setTab] = useState<'code' | 'preview'>('code');
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();
  const toolResultBoxRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);

  const [toolCode, setToolCode] = useState<string>('');
  const baseToolCodeRef = useRef<string>('');

  const [isDirty, setIsDirty] = useState(false);
  const [toolResult, setToolResult] = useState<object | null>(null);
  const [chatInboxId, setChatInboxId] = useState<string | null>(null);
  const [chatInboxIdMetadata, setChatInboxIdMetadata] = useState<
    string | undefined
  >(undefined);

  const {
    isMetadataGenerationPending,
    isMetadataGenerationSuccess,
    isMetadataGenerationIdle,
    metadataGenerationData,
    metadataGenerationError,
    isMetadataGenerationError,
    forceGenerateMetadata,
  } = useToolMetadata({ chatInboxIdMetadata });

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

  const chatConversationData: ChatConversationInfiniteData | undefined =
    useMemo(() => {
      if (!data) return;
      const formattedData = data?.pages?.map((page) => {
        return page.map((message) => {
          return {
            ...message,
            content:
              message.role === 'user'
                ? message.content?.split('INPUT:\n\n')?.[1]
                : message.content,
          };
        });
      });
      return {
        ...data,
        pages: formattedData,
      };
    }, [data]);

  const { mutateAsync: createToolMetadata } = useCreateToolMetadata();
  const {
    mutateAsync: executeCode,
    isPending: isExecutingCode,
    isSuccess: isCodeExecutionSuccess,
    isError: isCodeExecutionError,
    error: codeExecutionError,
  } = useExecuteToolCode({
    onSuccess: (data) => {
      setToolResult(data);
      setTimeout(() => {
        if (toolResultBoxRef.current) {
          toolResultBoxRef.current.scrollTop =
            toolResultBoxRef.current.scrollHeight;
        }
      }, 300);
    },
  });

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
    },
  });

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

  const onSubmit = async (data: CreateToolCodeFormSchema) => {
    if (!auth) return;
    await createToolCode({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      message: data.message,
      llmProviderId: data.llmProviderId,
      jobId: chatInboxId ? extractJobIdFromInbox(chatInboxId ?? '') : undefined,
    });

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
      llmProviderId: form.getValues('llmProviderId'),
    });
  };

  const handleSaveTool = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const metadataCode = new FormData(e.currentTarget).get('editor');
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

    if (!chatInboxId) return;
    await saveToolCode({
      code: toolCode,
      metadata: {
        ...parsedMetadata,
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
                      !chatInboxId ||
                      isSavingTool
                    }
                    form="metadata-form"
                    isLoading={isSavingTool}
                    size="sm"
                    type="submit"
                    variant="outline"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Tool
                  </Button>
                </div>
              </div>

              <TabsContent
                className="mt-1 h-full space-y-4 overflow-y-auto whitespace-pre-line break-words py-4 pb-8 pr-3"
                ref={toolResultBoxRef}
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
                          language="ts"
                          name="editor"
                          onUpdate={(currentCode) => {
                            setIsDirty(currentCode !== baseToolCodeRef.current);
                          }}
                          value={toolCode}
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
                  {(isMetadataGenerationPending || isToolGenerating) && (
                    <div className="text-gray-80 flex flex-col items-center gap-2 py-4 text-xs">
                      <Loader2 className="shrink-0 animate-spin" />
                      Generating...
                    </div>
                  )}
                  {!isMetadataGenerationPending &&
                    !isToolGenerating &&
                    isMetadataGenerationError && (
                      <ToolErrorFallback
                        error={new Error(metadataGenerationError ?? '')}
                        resetErrorBoundary={regenerateToolMetadata}
                      />
                    )}
                  {isMetadataGenerationSuccess &&
                    !isToolGenerating &&
                    !isMetadataGenerationError && (
                      <div className="text-gray-80 text-xs">
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
                        <AnimatePresence>
                          {(isExecutingCode ||
                            isCodeExecutionError ||
                            isCodeExecutionSuccess) && (
                            <motion.div
                              animate={{ opacity: 1, x: 0 }}
                              className="flex flex-col border-t border-gray-200 bg-gray-300 py-2 pb-4"
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
                                    Tool execution failed. Try generating the
                                    tool code again.
                                  </p>
                                  <pre className="max-w-sm whitespace-break-spaces text-center">
                                    {codeExecutionError?.response?.data
                                      ?.message ?? codeExecutionError?.message}
                                  </pre>
                                </div>
                              )}
                              {isCodeExecutionSuccess && toolResult && (
                                <div className="py-2">
                                  <ToolCodeEditor
                                    language="json"
                                    readOnly
                                    style={{ height: '200px' }}
                                    value={JSON.stringify(toolResult, null, 2)}
                                  />
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  {isMetadataGenerationIdle && !isToolGenerating && (
                    <div>
                      <p className="text-gray-80 py-4 pt-6 text-center text-xs">
                        No metadata generated yet.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent
                className="mt-1 h-full space-y-4 overflow-y-auto whitespace-pre-line break-words py-4 pr-3"
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
                    !isToolGenerating &&
                    isMetadataGenerationError && (
                      <ToolErrorFallback
                        error={new Error(metadataGenerationError ?? '')}
                        resetErrorBoundary={regenerateToolMetadata}
                      />
                    )}

                  {isMetadataGenerationSuccess &&
                    !isMetadataGenerationError && (
                      <div className="text-gray-80 text-xs">
                        <form
                          className="space-y-4"
                          id="metadata-form"
                          onSubmit={handleSaveTool}
                        >
                          <div className="py-2">
                            <ToolCodeEditor
                              language="json"
                              style={{ height: '80vh' }}
                              value={
                                metadataGenerationData != null
                                  ? JSON.stringify(
                                      {
                                        ...metadataGenerationData,
                                        author: auth?.shinkai_identity ?? '',
                                      },
                                      null,
                                      2,
                                    )
                                  : 'Invalid metadata'
                              }
                            />
                          </div>
                        </form>
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
        {/*<DialogDescription>blaalalal</DialogDescription>*/}
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
