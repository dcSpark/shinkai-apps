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
import { ArrowRight, ArrowUpRight, StoreIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { AIModelSelector } from '../components/chat/chat-action-bar/ai-update-selection-action-bar';
import { getRandomWidth } from '../components/playground-tool/components/code-panel';
import { LanguageToolSelector } from '../components/playground-tool/components/language-tool-selector';
import { ToolsSelection } from '../components/playground-tool/components/tools-selection';
import { usePlaygroundStore } from '../components/playground-tool/context/playground-context';
import { useCreateToolAndSave } from '../components/playground-tool/hooks/use-create-tool-and-save';
import { useToolForm } from '../components/playground-tool/hooks/use-tool-code';
import PlaygroundToolLayout from '../components/playground-tool/layout';
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

  useEffect(() => {
    if (isError) {
      toast.error('Failed to create a tool', {
        description: error,
      });
    }
  }, [isError, error]);

  if (isProcessing) {
    return (
      <div className={cn('min-h-full flex-1 overflow-auto')}>
        <PlaygroundToolLayout
          leftElement={
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
          }
          rightElement={
            <div className="flex w-full flex-col items-start gap-1 px-4 py-4 text-xs">
              {[...Array(20)].map((_, lineIndex) => (
                <div className="mb-2 flex gap-3" key={lineIndex}>
                  <Skeleton className="bg-official-gray-900 h-4 w-12 rounded" />
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      {[...Array(Math.floor(Math.random() * 4) + 1)].map(
                        (_, blockIndex) => (
                          <Skeleton
                            className={cn(
                              getRandomWidth(),
                              'bg-official-gray-900 h-4 rounded',
                            )}
                            key={blockIndex}
                          />
                        ),
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <p className="sr-only">Generating Code...</p>
            </div>
          }
          topElement={
            <div className="bg-official-gray-950 border-official-gray-780 flex items-center justify-between border-b p-4">
              <Skeleton className="bg-official-gray-900 h-8 w-48" />
              <Skeleton className="bg-official-gray-900 h-8 w-[300px]" />
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
            Visit App Store
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
                      placeholder={'Ask AI to create a tool for you...'}
                      textareaClassName="min-h-[90px]"
                      value={form.watch('message')}
                    />

                    <div className="flex w-full items-center justify-center gap-3 py-6">
                      {[
                        {
                          text: 'Download website as markdown',
                          prompt:
                            'Generate a tool for downloading a website into markdown',
                        },
                        {
                          text: 'Get Hacker News stories',
                          prompt:
                            'Generate a tool for getting top tech-related stories from Hacker News, include the title, author, and URL of the story',
                        },
                        {
                          text: 'Podcast summary',
                          prompt:
                            'Generate a tool for summarizing a podcast, include the title, author, and URL of the story',
                        },
                      ].map((suggestion) => (
                        <Button
                          key={suggestion.text}
                          onClick={() =>
                            form.setValue('message', suggestion.prompt)
                          }
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
