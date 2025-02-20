import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { CodeLanguage } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import {
  BackgroundBeams,
  Button,
  buttonVariants,
  ChatInputArea,
  Form,
  Skeleton,
} from '@shinkai_network/shinkai-ui';
import { SendIcon } from '@shinkai_network/shinkai-ui/assets';
import { useScrollRestoration } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, LoaderIcon, StoreIcon } from 'lucide-react';
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
import {
  DockerStatus,
  ImportToolModal,
  ToolCollection,
} from '../components/tools/tool-collection';
import { VideoBanner } from '../components/video-banner';
import { TutorialBanner } from '../store/settings';
import { SHINKAI_TUTORIALS } from '../utils/constants';
import { SHINKAI_STORE_URL } from '../utils/store';

export const ToolsHomepage = () => {
  const { t } = useTranslation();
  const form = useToolForm();
  const toolHomepageScrollPositionRef = usePlaygroundStore(
    (state) => state.toolHomepageScrollPositionRef,
  );

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
      toast.error('Failed to create a tool', {
        description: error,
      });
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
              <div className="flex h-[154px] w-full flex-col items-center justify-between gap-2 rounded-lg p-4">
                <div className="flex w-full items-center gap-2">
                  <Skeleton className="bg-official-gray-900 h-8 w-24 rounded-lg" />
                  <Skeleton className="bg-official-gray-900 h-8 w-16 rounded-lg" />
                </div>
                <Skeleton className="bg-official-gray-900 w-full flex-1 rounded" />
              </div>
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
                            <p className="text-red-500">{error}</p>
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
      <div className="mx-auto max-w-4xl pb-[80px]">
        <div className="mb-[80px] flex items-center justify-end gap-3 px-0 py-4">
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-20">
            <div className="flex min-h-[300px] w-full flex-col items-center justify-between gap-10 pt-2">
              <div className="flex flex-col gap-2">
                <h1 className="font-clash text-center text-5xl font-semibold">
                  Build AI Tools in Minutes
                </h1>
                <p className="text-official-gray-400 text-center text-lg">
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
                        <div className="flex items-end justify-between gap-3 pb-1 pl-1">
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
                            <ToolsSelection
                              onChange={(value) => {
                                form.setValue('tools', value);
                              }}
                              value={form.watch('tools')}
                            />
                          </div>

                          <Button
                            disabled={form.watch('message') === ''}
                            isLoading={isProcessing}
                            onClick={() =>
                              createToolAndSaveTool(form.getValues())
                            }
                            rounded="lg"
                            size="xs"
                            type="button"
                          >
                            <SendIcon className="size-4" />
                            <span className="sr-only">
                              {t('chat.sendMessage')}
                            </span>
                          </Button>
                        </div>
                      }
                      disabled={isProcessing}
                      onChange={(value) => {
                        form.setValue('message', value);
                      }}
                      onSubmit={form.handleSubmit(createToolAndSaveTool)}
                      placeholder={'Describe the tool you want to create...'}
                      textareaClassName="min-h-[90px]"
                      value={form.watch('message')}
                    />

                    <div className="flex w-full flex-wrap items-center justify-center gap-3 py-6">
                      {[
                        {
                          text: 'Generate video transcripts from audio',
                          prompt:
                            'Create a Python tool that converts video files to SRT subtitles using the Faster Whisper speech-to-text model. The tool should accept a video filename and Whisper model configuration (size, device, compute type) as inputs, transcribe the audio using faster-whisper, format the results as SRT subtitles, and save them alongside the original video. Return the path to the generated SRT file. Add default values to CONFIG if possible.',
                          language: CodeLanguage.Python,
                        },
                        {
                          text: 'Download pdf from url',
                          prompt:
                            'Create a tool that downloads and saves a pdf from a URL.',
                          language: CodeLanguage.Python,
                        },
                        // {
                        //   text: 'Retrieve Cryptocurrency Market Data',
                        //   prompt:
                        //     'Create a coinmarketcap tool to retrieve the current data for a selection of cryptocurrencies. Cryptocurrencies will be given as input using their symbols.',
                        //   language: CodeLanguage.Python,
                        // },
                        // {
                        //   text: 'NASA astronomy picture of the day',
                        //   prompt:
                        //     'Create a tool to retrieve and show the NASA astronomy picture of the day. Use the system date to know the date.',
                        //   language: CodeLanguage.Python,
                        // },
                        {
                          text: 'Export text to .odt file',
                          prompt:
                            'Create a tool that allows to export text to an .odt file (OpenDocument). The text is given as input.',
                          language: CodeLanguage.Typescript,
                        },

                        {
                          text: 'Fetch Crypto Prices from Coingeckos API',
                          prompt:
                            'Create a Python tool that interacts with the CoinGecko API to fetch cryptocurrency market data, implementing both free and pro API endpoints. The tool should accept configuration parameters including an optional API key, and input parameters for pagination (page, page_size), sorting options (by market cap, volume, or ID in ascending or descending order), filtering by volume and market cap ranges, and currency denomination. Implement robust error handling with retry logic using the tenacity library, handle rate limiting appropriately, and include fallback mock data for testing purposes. The tool should return a structured output containing formatted coin data (including ID, symbol, name, current price, market cap, volume, and 24-hour price change) along with pagination details. Ensure the implementation follows type hints, includes proper API status checking, and formats the response data consistently.',
                          language: CodeLanguage.Typescript,
                        },
                        {
                          text: 'Get Hacker News stories',
                          prompt:
                            'Generate a tool for getting top tech-related stories from Hacker News, include the title, author, and URL of the story',
                          language: CodeLanguage.Typescript,
                        },
                      ].map((suggestion) => (
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

            <VideoBanner
              name={TutorialBanner.SHINKAI_TOOLS}
              title="Welcome to the Shinkai Tools"
              videoUrl={SHINKAI_TUTORIALS['shinkai-tools']}
            />

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
