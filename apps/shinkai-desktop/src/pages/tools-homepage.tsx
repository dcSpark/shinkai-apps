import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { CodeLanguage } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useOpenToolInCodeEditor } from '@shinkai_network/shinkai-node-state/v2/mutations/openToolnCodeEditor/useOpenToolInCodeEditor';
import {
  BackgroundBeams,
  Button,
  buttonVariants,
  ChatInputArea,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Skeleton,
} from '@shinkai_network/shinkai-ui';
import { SendIcon } from '@shinkai_network/shinkai-ui/assets';
import { useScrollRestoration } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  CircleAlert,
  LoaderIcon,
  StoreIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { AIModelSelector } from '../components/chat/chat-action-bar/ai-update-selection-action-bar';
import { MessageList } from '../components/chat/components/message-list';
import { getRandomWidth } from '../components/playground-tool/components/code-panel';
import { LanguageToolSelector } from '../components/playground-tool/components/language-tool-selector';
import { ToolsSelection } from '../components/playground-tool/components/tools-selection';
import { usePlaygroundStore } from '../components/playground-tool/context/playground-context';
import { useCreateToolAndSave } from '../components/playground-tool/hooks/use-create-tool-and-save';
import {
  useChatConversation,
  useToolForm,
} from '../components/playground-tool/hooks/use-tool-code';
import PlaygroundToolLayout from '../components/playground-tool/layout';
import ToolCodeEditor from '../components/playground-tool/tool-code-editor';
import { TOOL_HOMEPAGE_SUGGESTIONS } from '../components/tools/constants';
import ImportToolModal from '../components/tools/import-tool';
import {
  DockerStatus,
  ToolCollection,
} from '../components/tools/tool-collection';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';
import { SHINKAI_STORE_URL } from '../utils/store';

export const ToolsHomepage = () => {
  const { t } = useTranslation();
  const form = useToolForm();
  const auth = useAuth((state) => state.auth);
  const toolHomepageScrollPositionRef = usePlaygroundStore(
    (state) => state.toolHomepageScrollPositionRef,
  );
  const xShinkaiToolId = usePlaygroundStore((state) => state.xShinkaiToolId);
  const xShinkaiAppId = usePlaygroundStore((state) => state.xShinkaiAppId);

  const defaulAgentId = useSettings((state) => state.defaultAgentId);
  const currentAI = form.watch('llmProviderId');

  const isCodeGeneratorModel = currentAI === 'CODE_GENERATOR';

  const {
    mutateAsync: openToolInCodeEditor,
    isPending: isOpeningToolInCodeEditor,
  } = useOpenToolInCodeEditor({
    onSuccess: () => {
      toast.success(t('tools.successOpenToolInCodeEditor'));
    },
    onError: (error) => {
      toast.error(t('tools.errorOpenToolInCodeEditor'), {
        description: error.response?.data?.message ?? error.message,
      });
    },
  });

  const [step, setStep] = useState<'code' | 'metadata'>('code');

  const scrollElementRef = useRef<HTMLDivElement>(null);
  useScrollRestoration({
    key: 'tools',
    containerRef: scrollElementRef,
    scrollTopStateRef: toolHomepageScrollPositionRef,
  });

  const { createToolAndSaveTool, isProcessing, isError, error } =
    useCreateToolAndSave({
      form,
      feedbackRequired: isCodeGeneratorModel,
    });

  const toolCode = usePlaygroundStore((state) => state.toolCode);
  const toolCodeStatus = usePlaygroundStore((state) => state.toolCodeStatus);
  const toolMetadata = usePlaygroundStore((state) => state.toolMetadata);
  const toolMetadataStatus = usePlaygroundStore(
    (state) => state.toolMetadataStatus,
  );

  const chatInboxId = usePlaygroundStore((state) => state.chatInboxId);
  const resetPlaygroundStore = usePlaygroundStore(
    (state) => state.resetPlaygroundStore,
  );

  const {
    conversationData,
    fetchPreviousPage,
    hasPreviousPage,
    isChatConversationLoading,
    isFetchingPreviousPage,
    isChatConversationSuccess,
  } = useChatConversation(chatInboxId);

  useEffect(() => {
    if (isError) {
      resetPlaygroundStore();
    }
  }, [isError, error, resetPlaygroundStore]);

  useEffect(() => {
    if (toolCode && !toolMetadata) {
      setTimeout(() => {
        setStep('metadata');
      }, 1500);
    }
    if (!toolCode) {
      setStep('code');
    }
  }, [toolCode, toolMetadata]);

  if (isProcessing) {
    return (
      <div className={cn('min-h-full flex-1 overflow-auto')}>
        <PlaygroundToolLayout
          leftElement={
            <div className={cn('flex flex-1 flex-col overflow-y-auto px-2')}>
              {chatInboxId ? (
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
              ) : (
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
              )}
              <Form {...form}>
                <form
                  className="shrink-0 space-y-2 px-3 pt-2"
                  onSubmit={form.handleSubmit(createToolAndSaveTool)}
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
                                  <div className="relative z-50 flex items-end gap-3 self-end">
                                    <span className="pb-1 text-xs font-light text-gray-100">
                                      <span className="font-medium">Enter</span>{' '}
                                      to send
                                    </span>
                                    <Button
                                      className={cn(
                                        'bg-official-gray-850 h-[40px] w-[40px] cursor-pointer rounded-xl p-3 transition-colors',
                                        'disabled:text-gray-80 disabled:bg-official-gray-800 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border disabled:border-gray-200 hover:disabled:bg-gray-300',
                                      )}
                                      // disabled={
                                      //   isToolCodeGenerationPending ||
                                      //   isMetadataGenerationPending ||
                                      //   !form.watch('message')
                                      // }
                                      // onClick={form.handleSubmit(
                                      //   handleCreateToolCode,
                                      // )}
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
                                // disabled={
                                //   // isToolCodeGenerationPending ||
                                //   // isMetadataGenerationPending
                                // }
                                onChange={field.onChange}
                                onSubmit={form.handleSubmit(
                                  createToolAndSaveTool,
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
            </div>
          }
          rightElement={
            <div className="flex size-full flex-col items-center justify-center gap-1 p-1 text-xs">
              <div className="relative mx-auto h-[400px] w-full max-w-2xl overflow-hidden rounded-lg md:order-2 md:h-[450px] lg:h-[600px]">
                <AnimatePresence mode="wait">
                  {step === 'code' && (
                    <motion.div
                      animate={{ y: 0, opacity: 1 }}
                      className="border-official-gray-950 bg-official-gray-1000 flex h-full w-full flex-1 flex-col gap-3 overflow-hidden rounded-lg p-3"
                      exit={{ y: -100, opacity: 0 }}
                      initial={{ y: 100, opacity: 0, rotateX: -20 }}
                      key={toolCodeStatus}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    >
                      <div className="flex items-center gap-3">
                        {toolCodeStatus === 'pending' ? (
                          <LoaderIcon className="size-4 animate-spin text-cyan-500" />
                        ) : toolCodeStatus === 'success' ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-500">
                            ✓
                          </div>
                        ) : toolCodeStatus === 'error' ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-red-500">
                            ✗
                          </div>
                        ) : null}
                        <h3 className="font-medium text-zinc-100">
                          {toolCodeStatus === 'pending'
                            ? 'Generating Code...'
                            : toolCodeStatus === 'error'
                              ? 'Generating Code Failed'
                              : toolCodeStatus === 'success'
                                ? 'Code Generated'
                                : null}
                        </h3>
                      </div>

                      <AnimatePresence mode="wait">
                        {toolCodeStatus === 'pending' && (
                          <motion.div
                            animate={{ opacity: 1 }}
                            className="size-w flex flex-1 flex-col items-start gap-1 overflow-hidden rounded-md px-4 py-4 text-xs"
                            exit={{ opacity: 0 }}
                            initial={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                          >
                            {[...Array(20)].map((_, lineIndex) => (
                              <div className="mb-2 flex gap-3" key={lineIndex}>
                                <Skeleton className="bg-official-gray-900 h-4 w-12 rounded" />
                                <div className="flex-1">
                                  <div className="flex flex-wrap gap-2">
                                    {[
                                      ...Array(
                                        Math.floor(Math.random() * 4) + 1,
                                      ),
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
                        )}
                        {toolCodeStatus === 'success' && (
                          <motion.div
                            animate={{ opacity: 1 }}
                            className={cn('flex-1 overflow-auto rounded-md')}
                            exit={{ opacity: 0 }}
                            initial={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                          >
                            <ToolCodeEditor
                              language={form.watch('language').toLowerCase()}
                              readOnly
                              value={toolCode}
                            />
                          </motion.div>
                        )}
                        {toolCodeStatus === 'error' && (
                          <motion.div
                            animate={{ opacity: 1 }}
                            className="flex size-full flex-1 flex-col items-start gap-1 overflow-auto rounded-md px-4 py-4 text-xs"
                            exit={{ opacity: 0 }}
                            initial={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                          >
                            <p className="text-red-500">
                              Failed to generate code
                            </p>
                            <p className="break-words text-red-500">{error}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {step === 'metadata' && (
                    <motion.div
                      animate={{ y: 0, opacity: 1, rotateX: 0 }}
                      className="border-official-gray-950 bg-official-gray-1000 flex h-full w-full flex-1 flex-col gap-3 overflow-hidden rounded-lg p-3"
                      exit={{ y: -100, opacity: 0, rotateX: 20 }}
                      initial={{ y: 100, opacity: 0, rotateX: -20 }}
                      key={toolMetadataStatus}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {toolMetadataStatus === 'pending' && (
                            <>
                              <LoaderIcon className="size-4 animate-spin text-cyan-500" />
                              <h3 className="font-medium text-zinc-100">
                                Generating Preview...
                              </h3>
                            </>
                          )}
                          {toolMetadataStatus === 'success' && (
                            <>
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-500">
                                <span className="font-bold">✓</span>
                              </div>
                              <h3 className="font-medium text-zinc-100">
                                Metadata Successfully Generated
                              </h3>
                            </>
                          )}
                          {toolMetadataStatus === 'error' && (
                            <h3 className="font-medium text-red-500">
                              Failed to Generate Metadata
                            </h3>
                          )}
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        {toolMetadataStatus === 'pending' && (
                          <motion.div
                            animate={{ opacity: 1 }}
                            className="flex w-full flex-1 flex-col items-start gap-1 overflow-hidden rounded-md px-4 py-4 text-xs"
                            exit={{ opacity: 0 }}
                            initial={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                          >
                            {[...Array(20)].map((_, lineIndex) => (
                              <div className="mb-2 flex gap-3" key={lineIndex}>
                                <Skeleton className="bg-official-gray-900 h-4 w-12 rounded" />
                                <div className="flex-1">
                                  <div className="flex flex-wrap gap-2">
                                    {[
                                      ...Array(
                                        Math.floor(Math.random() * 4) + 1,
                                      ),
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
                        )}
                        {toolMetadataStatus === 'success' && (
                          <motion.div
                            animate={{ opacity: 1 }}
                            className="flex w-full flex-1 flex-col items-start gap-1 overflow-auto rounded-md text-xs"
                            exit={{ opacity: 0 }}
                            initial={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                          >
                            <ToolCodeEditor
                              language="json"
                              readOnly
                              value={JSON.stringify(toolMetadata, null, 2)}
                            />
                          </motion.div>
                        )}
                        {toolMetadataStatus === 'error' && (
                          <motion.div
                            animate={{ opacity: 1 }}
                            className="flex size-full flex-col items-start gap-1 px-4 py-4 text-xs"
                            exit={{ opacity: 0 }}
                            initial={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                          >
                            <p className="text-red-500">
                              Failed to generate metadata
                            </p>
                            <p className="text-red-500">{error}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
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
  }

  return (
    <div
      className={cn('min-h-full flex-1 overflow-auto')}
      ref={scrollElementRef}
    >
      <div className="container pb-[80px]">
        <div className="mb-[80px] flex items-center justify-end gap-3 px-0 py-4">
          <div className="flex items-center gap-3">
            <DockerStatus />
            <ImportToolModal />
            <Link
              className={cn(
                buttonVariants({
                  size: 'xs',
                  variant: 'outline',
                  rounded: 'lg',
                }),
              )}
              rel="noreferrer"
              target="_blank"
              to={SHINKAI_STORE_URL}
            >
              <StoreIcon className="size-4" />
              {t('tools.store.label')}
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-20">
            <div className="flex min-h-[300px] w-full flex-col items-center justify-between gap-10 pt-2">
              <div className="flex flex-col gap-2">
                <h1 className="font-clash text-center text-4xl font-medium text-white">
                  Build AI Tools in Minutes
                </h1>
                <p className="text-official-gray-400 text-center text-sm">
                  Create, automate, and optimize your workflow with powerful AI
                  tools.
                </p>
              </div>

              <div className="w-full max-w-3xl">
                <Form {...form}>
                  <form>
                    <ChatInputArea
                      autoFocus
                      bottomAddons={
                        <div className="flex items-end justify-between gap-3 px-3 pb-2">
                          <div className="flex items-center gap-3">
                            <AIModelSelector
                              onValueChange={(value) => {
                                form.setValue('llmProviderId', value);
                              }}
                              value={form.watch('llmProviderId')}
                            />
                            <LanguageToolSelector
                              onValueChange={(value) => {
                                form.setValue(
                                  'language',
                                  value as CodeLanguage,
                                );
                              }}
                              value={form.watch('language')}
                            />
                            {!isCodeGeneratorModel && (
                              <ToolsSelection
                                onChange={(value) => {
                                  form.setValue('tools', value);
                                }}
                                value={form.watch('tools')}
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {!isCodeGeneratorModel && (
                              <Button
                                className="flex items-center gap-2 border-none"
                                isLoading={isOpeningToolInCodeEditor}
                                onClick={() => {
                                  if (!auth) return;
                                  openToolInCodeEditor({
                                    token: auth?.api_v2_key,
                                    language: form.watch('language'),
                                    nodeAddress: auth?.node_address,
                                    xShinkaiAppId,
                                    xShinkaiToolId,
                                    xShinkaiLLMProvider: defaulAgentId,
                                  });
                                }}
                                rounded="lg"
                                size="xs"
                                type="button"
                                variant="link"
                              >
                                Create in VSCode/Cursor
                              </Button>
                            )}
                            <Button
                              className={cn('size-[36px] p-2')}
                              disabled={form.watch('message') === ''}
                              isLoading={isProcessing}
                              onClick={() =>
                                createToolAndSaveTool(form.getValues())
                              }
                              size="icon"
                            >
                              <SendIcon className="h-full w-full" />
                              <span className="sr-only">
                                {t('chat.sendMessage')}
                              </span>
                            </Button>
                          </div>
                        </div>
                      }
                      disabled={isProcessing}
                      onChange={(value) => {
                        form.setValue('message', value);
                      }}
                      onSubmit={form.handleSubmit(createToolAndSaveTool)}
                      placeholder={'Describe the tool you want to create...'}
                      textareaClassName="max-h-[40vh] min-h-[120px] p-4 text-sm"
                      value={form.watch('message')}
                    />
                    {error && (
                      <div className="mt-3 flex max-w-full items-start gap-2 rounded-md bg-[#2d0607]/40 px-3 py-2.5 text-xs font-medium text-[#ff9ea1]">
                        <CircleAlert className="mt-1 size-4 shrink-0" />
                        <div className="flex flex-1 flex-col gap-0.5">
                          <div className="-ml-2.5 w-full shrink-0 truncate rounded-full px-2.5 py-1 text-xs">
                            Failed to generate tool. You might want to try using
                            a more powerful AI model for better results.
                          </div>
                          <div className="text-gray-80 py-1">{error}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex w-full flex-wrap items-center justify-center gap-3 py-6">
                      {TOOL_HOMEPAGE_SUGGESTIONS.map((suggestion) => (
                        <Button
                          key={suggestion.text}
                          onClick={() => {
                            form.setValue('message', suggestion.prompt);
                            if (suggestion.language) {
                              form.setValue('language', suggestion.language);
                            }
                          }}
                          size="xs"
                          type="button"
                          variant="outline"
                        >
                          {suggestion.text}
                          <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      ))}
                    </div>
                  </form>
                </Form>
              </div>
            </div>

            <ToolCollection />

            <div className="bg-official-gray-1100 relative rounded-lg">
              <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-8 p-10 text-center">
                <div className="flex flex-col gap-2">
                  <h3 className="font-clash max-w-xl text-2xl font-semibold tracking-normal">
                    Discover More Tools
                  </h3>
                  <p className="text-official-gray-400 max-w-xl text-base leading-relaxed tracking-tight">
                    Explore and install tools from our App Store to boost your
                    productivity and automate your workflow.
                  </p>
                </div>
                <div className="isolate flex flex-row gap-4">
                  <a
                    className={cn(buttonVariants({ size: 'sm' }), 'gap-4 px-4')}
                    href={SHINKAI_STORE_URL}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Visit App Store <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <BackgroundBeams />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
