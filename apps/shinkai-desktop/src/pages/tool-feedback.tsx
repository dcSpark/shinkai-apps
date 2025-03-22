import { useTranslation } from '@shinkai_network/shinkai-i18n';
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
import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { MessageList } from '../components/chat/components/message-list';
import { getRandomWidth } from '../components/playground-tool/components/code-panel';
import {
  ToolCreationState,
  usePlaygroundStore,
} from '../components/playground-tool/context/playground-context';
import { useToolForm } from '../components/playground-tool/hooks/use-tool-code';
import { useToolFlow } from '../components/playground-tool/hooks/use-tool-flow';
import PlaygroundToolLayout from '../components/playground-tool/layout';

function ToolFeedbackPrompt() {
  const { inboxId } = useParams();
  const form = useToolForm();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    currentStep,
    isCreatingToolCode,
    startToolCreation,
    chatConversationData: conversationData,
    fetchPreviousPage,
    hasPreviousPage,
    isChatConversationLoading,
    isFetchingPreviousPage,
    isChatConversationSuccess,
    error,
  } = useToolFlow({
    form,
    initialInboxId: inboxId,
  });

  const resetPlaygroundStore = usePlaygroundStore(
    (state) => state.resetPlaygroundStore,
  );

  useEffect(() => {
    if (error) {
      resetPlaygroundStore();
      navigate('/tools');
    }
  }, [error, resetPlaygroundStore, navigate]);

  const renderStep = useCallback(() => {
    switch (currentStep) {
      case ToolCreationState.PROMPT_INPUT:
      case ToolCreationState.PLAN_REVIEW:
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
                  onClick={() => navigate('/tools')}
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
                  onSubmit={(e) => {
                    e.preventDefault();
                    startToolCreation(form.getValues());
                  }}
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
                                        isCreatingToolCode
                                      }
                                      isLoading={isCreatingToolCode}
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
                                disabled={isCreatingToolCode}
                                onChange={field.onChange}
                                onSubmit={() => {
                                  startToolCreation(form.getValues());
                                }}
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
      case ToolCreationState.CREATING_CODE:
      case ToolCreationState.CREATING_METADATA:
      case ToolCreationState.SAVING_TOOL:
      case ToolCreationState.COMPLETED:
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
                      onSubmit={(e) => {
                        e.preventDefault();
                        startToolCreation(form.getValues());
                      }}
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
                                    onSubmit={() => {
                                      startToolCreation(form.getValues());
                                    }}
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
                      key={currentStep}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    >
                      <div className="flex items-center gap-3">
                        {currentStep === ToolCreationState.CREATING_CODE ? (
                          <LoaderIcon className="size-4 animate-spin text-cyan-500" />
                        ) : currentStep ===
                          ToolCreationState.CREATING_METADATA ? (
                          <LoaderIcon className="size-4 animate-spin text-cyan-500" />
                        ) : currentStep === ToolCreationState.SAVING_TOOL ? (
                          <LoaderIcon className="size-4 animate-spin text-cyan-500" />
                        ) : currentStep === ToolCreationState.COMPLETED ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-500">
                            ✓
                          </div>
                        ) : null}
                        {/* : currentStep === 'error' ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-red-500">
                            ✗
                          </div>
                        )  */}
                        <h3 className="font-medium text-zinc-100">
                          {currentStep === ToolCreationState.CREATING_CODE
                            ? 'Generating Code...'
                            : currentStep ===
                                ToolCreationState.CREATING_METADATA
                              ? 'Generating Metadata...'
                              : currentStep === ToolCreationState.SAVING_TOOL
                                ? 'Saving Code & Preview...'
                                : currentStep === ToolCreationState.COMPLETED
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
      // case 'error':
      //   return (
      //     <div className="flex h-full items-center justify-center">
      //       <div className="text-center text-sm text-gray-100">
      //         <h1>Error</h1>
      //         <p>{error}</p>
      //       </div>
      //     </div>
      //   );
      default:
        return null;
    }
  }, [
    currentStep,
    isChatConversationLoading,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    isChatConversationSuccess,
    t,
    conversationData,
    form,
    navigate,
    startToolCreation,
    isCreatingToolCode,
  ]);

  return <div className={cn('h-full overflow-auto')}>{renderStep()}</div>;
}

export default ToolFeedbackPrompt;
