import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils';
import { useCreateToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolCode/useCreateToolCode';
import {
  Button,
  ChatInputArea,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Skeleton,
} from '@shinkai_network/shinkai-ui';
import { SendIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { motion } from 'framer-motion';
import { LoaderIcon, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { MessageList } from '../components/chat/components/message-list';
import { useWebSocketMessage } from '../components/chat/websocket-message';
import { getRandomWidth } from '../components/playground-tool/components/code-panel';
import { usePlaygroundStore } from '../components/playground-tool/context/playground-context';
import { useAutoSaveTool } from '../components/playground-tool/hooks/use-create-tool-and-save';
import {
  CreateToolCodeFormSchema,
  useChatConversation,
  useToolForm,
} from '../components/playground-tool/hooks/use-tool-code';
import { useToolMetadata } from '../components/playground-tool/hooks/use-tool-metadata';
import PlaygroundToolLayout from '../components/playground-tool/layout';
import { extractCodeLanguage } from '../components/playground-tool/utils/code';
import { useAuth } from '../store/auth';

type ToolStep =
  | 'initial-prompt'
  | 'generating-code'
  | 'generating-metadata'
  | 'completed'
  | 'completed-and-saved'
  | 'error';

function ToolFeedbackPrompt() {
  const { inboxId } = useParams();
  const auth = useAuth((state) => state.auth);
  const [step, setStep] = useState<ToolStep>('initial-prompt');
  const form = useToolForm();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const forceGenerateCode = useRef(false);
  const forceGenerateMetadata = useRef(false);

  const setToolCodeStatus = usePlaygroundStore(
    (state) => state.setToolCodeStatus,
  );
  const setToolCode = usePlaygroundStore((state) => state.setToolCode);
  const toolCode = usePlaygroundStore((state) => state.toolCode);
  const isToolCodeGenerationSuccess = usePlaygroundStore(
    (state) => state.toolCodeStatus === 'success',
  );

  const toolMetadata = usePlaygroundStore((state) => state.toolMetadata);

  const { mutateAsync: createToolCode, isPending: isCreateToolCodePending } =
    useCreateToolCode({
      onSuccess: () => {
        forceGenerateCode.current = true;
      },
    });

  useToolMetadata({
    tools: form.watch('tools'),
    forceGenerateMetadata,
  });

  const handleCreateToolCode = async (data: CreateToolCodeFormSchema) => {
    if (!auth) return;

    await createToolCode({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      message: data.message,
      llmProviderId: data.llmProviderId,
      jobId: inboxId ? extractJobIdFromInbox(inboxId) : undefined,
      tools: data.tools,

      language: data.language,
    });

    form.setValue('message', '');
  };

  const {
    conversationData,
    fetchPreviousPage,
    hasPreviousPage,
    isChatConversationLoading,
    isFetchingPreviousPage,
    isChatConversationSuccess,
  } = useChatConversation(inboxId);

  useWebSocketMessage({ inboxId: inboxId ?? '', enabled: !!inboxId });

  useEffect(() => {
    const lastMessage = conversationData?.pages?.at(-1)?.at(-1);
    if (!lastMessage || !forceGenerateCode.current) return;

    if (
      lastMessage?.role === 'assistant' &&
      lastMessage?.status.type === 'running'
    ) {
      setToolCodeStatus('pending');
      return;
    }
    if (
      lastMessage?.role === 'assistant' &&
      lastMessage?.status.type === 'complete'
    ) {
      const language = extractCodeLanguage(lastMessage.content);
      const codeBlockRegex = new RegExp(
        `\`\`\`${language?.toLowerCase() ?? ''}\\n([\\s\\S]*?)\\n\`\`\``,
      );
      const tsCodeMatch = lastMessage.content.match(codeBlockRegex);

      console.log(tsCodeMatch, 'tsCodeMatch');
      if (tsCodeMatch) {
        const generatedCode = tsCodeMatch[1].trim();
        setToolCode(generatedCode);
        setToolCodeStatus('success');
        // setStep('tool-details');
        forceGenerateMetadata.current = true;
        setStep('generating-metadata');
      } else {
        setStep('initial-prompt');
      }
    }
  }, [conversationData?.pages, form.watch('language')]);

  const {
    handleAutoSave,
    isSaveToolSuccess,
    isSaveToolError,
    saveToolCodeError,
  } = useAutoSaveTool();

  useEffect(() => {
    if (toolMetadata) {
      setStep('completed');
    }
  }, [toolMetadata]);

  useEffect(() => {
    if (toolCode && toolMetadata && isToolCodeGenerationSuccess) {
      setStep('completed');
      handleAutoSave({
        toolMetadata: toolMetadata,
        toolCode: toolCode,
        tools: form.getValues('tools'),
        language: form.getValues('language'),
        shouldPrefetchPlaygroundTool: true,
        onSuccess: () => {
          setStep('completed-and-saved');
        },
      });
    }
  }, [
    toolCode,
    toolMetadata,
    isToolCodeGenerationSuccess,
    handleAutoSave,
    form,
  ]);

  const renderStep = () => {
    switch (step) {
      case 'initial-prompt':
        return (
          <div
            className={cn(
              'flex h-full flex-col items-center justify-center py-10',
            )}
          >
            <motion.div
              className={cn(
                'mx-auto flex h-[80vh] w-full max-w-lg flex-col items-stretch justify-center rounded-xl border p-1 pb-3 pt-0',
              )}
              layoutId={`left-element`}
            >
              <div className="flex items-center justify-between px-4">
                <Button
                  className="size-6 p-1"
                  onClick={() => {
                    navigate('/tools');
                  }}
                  size="auto"
                  variant="tertiary"
                >
                  <LogOut className="size-full text-white" />
                </Button>
                <h1 className="font-clash py-3 text-center font-semibold">
                  Creating Tool
                </h1>
                <div className="size-6" />
              </div>
              {isChatConversationLoading ? (
                <div className="bg-official-gray-950 flex w-full flex-col gap-4 p-4">
                  <Skeleton className="bg-official-gray-900 h-6 w-32" />
                  <Skeleton className="bg-official-gray-900 h-24 w-full" />
                  <Skeleton className="bg-official-gray-900 h-24 w-full" />
                  <Skeleton className="bg-official-gray-900 h-6 w-32" />
                  <Skeleton className="bg-official-gray-900 h-24 w-full" />
                  <Skeleton className="bg-official-gray-900 h-24 w-full" />
                  <Skeleton className="bg-official-gray-900 h-6 w-32" />
                  <Skeleton className="bg-official-gray-900 h-24 w-full" />
                </div>
              ) : (
                <MessageList
                  containerClassName="px-3 pt-2 flex-1"
                  disabledRetryAndEdit={true}
                  fetchPreviousPage={fetchPreviousPage}
                  hasPreviousPage={hasPreviousPage}
                  hidePythonExecution={true}
                  isFetchingPreviousPage={isFetchingPreviousPage}
                  isLoading={isChatConversationLoading}
                  isSuccess={isChatConversationSuccess}
                  minimalistMode
                  noMoreMessageLabel={t('chat.allMessagesLoaded')}
                  paginatedMessages={conversationData}
                />
              )}
              <Form {...form}>
                <form
                  className="shrink-0 space-y-2 px-3 pt-2"
                  onSubmit={form.handleSubmit(handleCreateToolCode)}
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
                              <ChatInputArea
                                autoFocus
                                bottomAddons={
                                  <div className="relative z-50 flex items-end gap-3 self-end p-2">
                                    <span className="pb-1 text-xs font-light text-gray-100">
                                      <span className="font-medium">Enter</span>{' '}
                                      to send
                                    </span>

                                    <Button
                                      className={cn('size-[36px] p-2')}
                                      disabled={
                                        !form.watch('message') ||
                                        isCreateToolCodePending
                                      }
                                      isLoading={isCreateToolCodePending}
                                      size="icon"
                                      type="submit"
                                    >
                                      <SendIcon className="h-full w-full" />
                                      <span className="sr-only">
                                        {t('chat.sendMessage')}
                                      </span>
                                    </Button>
                                  </div>
                                }
                                disabled={isCreateToolCodePending}
                                onChange={field.onChange}
                                onSubmit={form.handleSubmit(
                                  handleCreateToolCode,
                                )}
                                placeholder="Send message..."
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
            </motion.div>
          </div>
        );
      case 'generating-code':
      case 'generating-metadata':
      case 'completed':
      case 'completed-and-saved':
        return (
          <div className={cn('size-full')}>
            <PlaygroundToolLayout
              leftElement={
                <motion.div
                  className={cn('flex flex-1 flex-col overflow-y-auto px-2')}
                  layoutId={`left-element`}
                >
                  <MessageList
                    containerClassName="px-3 pt-2"
                    disabledRetryAndEdit={true}
                    fetchPreviousPage={fetchPreviousPage}
                    hasPreviousPage={hasPreviousPage}
                    hidePythonExecution={true}
                    isFetchingPreviousPage={isFetchingPreviousPage}
                    isLoading={isChatConversationLoading}
                    isSuccess={isChatConversationSuccess}
                    minimalistMode
                    noMoreMessageLabel={t('chat.allMessagesLoaded')}
                    paginatedMessages={conversationData}
                  />

                  <Form {...form}>
                    <form
                      className="shrink-0 space-y-2 px-3 pt-2"
                      onSubmit={form.handleSubmit(handleCreateToolCode)}
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
                                  <ChatInputArea
                                    autoFocus
                                    bottomAddons={
                                      <div className="relative z-50 flex items-end gap-3 self-end p-2">
                                        <span className="pb-1 text-xs font-light text-gray-100">
                                          <span className="font-medium">
                                            Enter
                                          </span>{' '}
                                          to send
                                        </span>

                                        <Button
                                          className={cn('size-[36px] p-2')}
                                          size="icon"
                                          type="submit"
                                        >
                                          <SendIcon className="h-full w-full" />
                                          <span className="sr-only">
                                            {t('chat.sendMessage')}
                                          </span>
                                        </Button>
                                      </div>
                                    }
                                    disabled
                                    onChange={field.onChange}
                                    onSubmit={form.handleSubmit(
                                      handleCreateToolCode,
                                    )}
                                    placeholder="Send message..."
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
                </motion.div>
              }
              rightElement={
                <div className="flex size-full flex-col items-center justify-center gap-1 p-1 text-xs">
                  <div className="relative mx-auto h-[400px] w-full max-w-2xl overflow-hidden rounded-lg md:order-2 md:h-[450px] lg:h-[600px]">
                    <motion.div
                      animate={{ y: 0, opacity: 1 }}
                      className="border-official-gray-950 bg-official-gray-1000 flex h-full w-full flex-1 flex-col gap-3 overflow-hidden rounded-lg p-3"
                      exit={{ y: -100, opacity: 0 }}
                      initial={{ y: 100, opacity: 0, rotateX: -20 }}
                      key={step}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    >
                      <div className="flex items-center gap-3">
                        {step === 'generating-code' ? (
                          <LoaderIcon className="size-4 animate-spin text-cyan-500" />
                        ) : step === 'generating-metadata' ? (
                          <LoaderIcon className="size-4 animate-spin text-cyan-500" />
                        ) : step === 'completed' ? (
                          <LoaderIcon className="size-4 animate-spin text-cyan-500" />
                        ) : step === 'completed-and-saved' ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-500">
                            ✓
                          </div>
                        ) : step === 'error' ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-red-500">
                            ✗
                          </div>
                        ) : null}
                        <h3 className="font-medium text-zinc-100">
                          {step === 'generating-code'
                            ? 'Generating Code...'
                            : step === 'generating-metadata'
                              ? 'Generating Metadata...'
                              : step === 'completed'
                                ? 'Saving Code & Preview...'
                                : step === 'completed-and-saved'
                                  ? 'Code & Preview Saved'
                                  : null}
                        </h3>
                      </div>

                      <motion.div
                        animate={{ opacity: 1 }}
                        className="size-w flex flex-1 flex-col items-start gap-1 overflow-hidden rounded-md px-4 py-4 text-xs"
                        exit={{ opacity: 0 }}
                        initial={{ opacity: 0 }}
                        transition={{
                          duration: 0.5,
                          ease: 'easeInOut',
                        }}
                      >
                        {[...Array(20)].map((_, lineIndex) => (
                          <div className="mb-2 flex gap-3" key={lineIndex}>
                            <Skeleton className="bg-official-gray-900 h-4 w-12 rounded" />
                            <div className="flex-1">
                              <div className="flex flex-wrap gap-2">
                                {[
                                  ...Array(Math.floor(Math.random() * 4) + 1),
                                ].map((_, blockIndex) => (
                                  <Skeleton
                                    className={cn(
                                      getRandomWidth(),
                                      'bg-official-gray-900 h-4 rounded',
                                    )}
                                    key={blockIndex}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              }
              topElement={
                <div className="flex h-[45px] items-center justify-between gap-2 border-b border-gray-400 px-4 pb-2.5">
                  <Skeleton className="bg-official-gray-900 h-[30px] w-[200px]" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="bg-official-gray-900 h-[30px] w-[100px]" />
                    <Skeleton className="bg-official-gray-900 h-[30px] w-[40px]" />
                    <Skeleton className="bg-official-gray-900 h-[30px] w-[100px]" />
                  </div>
                </div>
              }
            />
          </div>
        );
      case 'error':
        return (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-sm text-gray-100">
              <h1>Error</h1>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className={cn('h-full overflow-auto')}>{renderStep()}</div>;
}

export default ToolFeedbackPrompt;
