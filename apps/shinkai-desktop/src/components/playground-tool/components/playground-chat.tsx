import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { CodeLanguage } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { ChatConversationInfiniteData } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/types';
import {
  Button,
  ChatInputArea,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@shinkai_network/shinkai-ui';
import { SendIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { InfiniteQueryObserverResult } from '@tanstack/react-query';
import { FetchPreviousPageOptions } from '@tanstack/react-query';
import { ArrowUpRight } from 'lucide-react';
import { memo } from 'react';
import { useFormContext } from 'react-hook-form';

import { AIModelSelector } from '../../chat/chat-action-bar/ai-update-selection-action-bar';
import { MessageList } from '../../chat/components/message-list';
import { usePlaygroundStore } from '../context/playground-context';
import { CreateToolCodeFormSchema } from '../hooks/use-tool-code';
import { LanguageToolSelector } from './language-tool-selector';
import { ToolsSelection } from './tools-selection';

const PlaygroundChatBase = ({
  mode,
  toolName,
  chatInboxId,
  handleCreateToolCode,
  fetchPreviousPage,
  hasPreviousPage,
  isFetchingPreviousPage,
  isChatConversationLoading,
  isChatConversationSuccess,
  chatConversationData,
}: {
  mode: 'create' | 'edit';
  toolName: string;
  chatInboxId: string;
  handleCreateToolCode: (data: CreateToolCodeFormSchema) => void;
  fetchPreviousPage: (
    options?: FetchPreviousPageOptions | undefined,
  ) => Promise<
    InfiniteQueryObserverResult<ChatConversationInfiniteData, Error>
  >;
  hasPreviousPage: boolean;
  isFetchingPreviousPage: boolean;
  isChatConversationLoading: boolean;
  isChatConversationSuccess: boolean;
  chatConversationData: ChatConversationInfiniteData | undefined;
}) => {
  const { t } = useTranslation();

  const toolCodeStatus = usePlaygroundStore((state) => state.toolCodeStatus);
  const isToolCodeGenerationPending = toolCodeStatus === 'pending';

  const toolMetadataStatus = usePlaygroundStore(
    (state) => state.toolMetadataStatus,
  );
  const isMetadataGenerationPending = toolMetadataStatus === 'pending';

  const form = useFormContext<CreateToolCodeFormSchema>();

  return (
    <>
      {/* <div className="flex items-center gap-3 px-2">
        <Link to={-1 as To}>
          <LucideArrowLeft className="text-gray-80 size-[18px]" />
          <span className="sr-only">{t('common.back')}</span>
        </Link>
        <h1 className="py-2 text-sm font-bold tracking-tight">
          {mode === 'create' ? 'Tool Playground' : `Edit ${toolName}`}
        </h1>
      </div> */}
      <div
        className={cn(
          'flex flex-1 flex-col overflow-y-auto px-2',
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
              Ask Shinkai AI to generate a tool for you. Provide a prompt and
              Shinkai AI will generate a tool code for you.
            </p>
            <div className="grid grid-cols-1 items-center gap-3">
              {[
                {
                  text: 'Download a website content in markdown',
                  prompt:
                    'Generate a tool for downloading a website into markdown',
                },
                {
                  text: 'Get tech-related stories from Hacker News',
                  prompt:
                    'Generate a tool for getting top tech-related stories from Hacker News, include the title, author, and URL of the story',
                },
              ].map((suggestion) => (
                <Button
                  key={suggestion.text}
                  onClick={() => form.setValue('message', suggestion.prompt)}
                  size="xs"
                  variant="outline"
                >
                  {suggestion.text}
                  <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              ))}
            </div>
          </>
        )}

        {chatInboxId && (
          <MessageList
            containerClassName="playground-scroll px-3"
            disabledRetryAndEdit={true}
            fetchPreviousPage={fetchPreviousPage}
            hasPreviousPage={hasPreviousPage}
            hidePythonExecution={true}
            isFetchingPreviousPage={isFetchingPreviousPage}
            isLoading={isChatConversationLoading}
            isSuccess={isChatConversationSuccess}
            minimalistMode
            noMoreMessageLabel={t('chat.allMessagesLoaded')}
            paginatedMessages={chatConversationData}
          />
        )}
      </div>

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
                    <div className="flex items-center gap-2">
                      <AIModelSelector
                        onValueChange={(value) => {
                          form.setValue('llmProviderId', value);
                        }}
                        value={form.watch('llmProviderId')}
                      />
                      <LanguageToolSelector
                        onValueChange={(value) => {
                          form.setValue('language', value as CodeLanguage);
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
                    <ChatInputArea
                      autoFocus
                      bottomAddons={
                        <div className="relative z-50 flex items-end gap-3 self-end">
                          <span className="pb-1 text-xs font-light text-gray-100">
                            <span className="font-medium">Enter</span> to send
                          </span>
                          <Button
                            className={cn(
                              'hover:bg-app-gradient h-[40px] w-[40px] cursor-pointer rounded-xl bg-gray-500 p-3 transition-colors',
                              'disabled:text-gray-80 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border disabled:border-gray-200 disabled:bg-gray-300 hover:disabled:bg-gray-300',
                            )}
                            disabled={
                              isToolCodeGenerationPending ||
                              isMetadataGenerationPending ||
                              !form.watch('message')
                            }
                            onClick={form.handleSubmit(handleCreateToolCode)}
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
                      disabled={
                        isToolCodeGenerationPending ||
                        isMetadataGenerationPending
                      }
                      onChange={field.onChange}
                      onSubmit={form.handleSubmit(handleCreateToolCode)}
                      value={field.value}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </form>
    </>
  );
};

export const PlaygroundChat = memo(PlaygroundChatBase);
