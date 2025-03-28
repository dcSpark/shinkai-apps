import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { CodeLanguage } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useOpenToolInCodeEditor } from '@shinkai_network/shinkai-node-state/v2/mutations/openToolnCodeEditor/useOpenToolInCodeEditor';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import {
  BackgroundBeams,
  Button,
  buttonVariants,
  ChatInputArea,
  Form,
  Skeleton,
} from '@shinkai_network/shinkai-ui';
import { SendIcon, ToolsIcon } from '@shinkai_network/shinkai-ui/assets';
import { useScrollRestoration } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import {
  ArrowRight,
  ArrowUpRight,
  CircleAlert,
  LogOut,
  StoreIcon,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { AIModelSelector } from '../components/chat/chat-action-bar/ai-update-selection-action-bar';
import { MessageList } from '../components/chat/components/message-list';
import { LanguageToolSelector } from '../components/playground-tool/components/language-tool-selector';
import { ToolsSelection } from '../components/playground-tool/components/tools-selection';
import {
  ToolCreationState,
  usePlaygroundStore,
} from '../components/playground-tool/context/playground-context';
import {
  CreateToolCodeFormSchema,
  useToolForm,
} from '../components/playground-tool/hooks/use-tool-code';
import { useToolFlow } from '../components/playground-tool/hooks/use-tool-flow';
import PlaygroundToolLayout from '../components/playground-tool/layout';
import ToolCreationStatus from '../components/tools/components/tool-creation-status';
import {
  CODE_GENERATOR_MODEL_ID,
  TOOL_HOMEPAGE_SUGGESTIONS,
} from '../components/tools/constants';
import ImportToolModal from '../components/tools/import-tool';
import {
  DockerStatus,
  ToolCollection,
} from '../components/tools/tool-collection';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';
import { useViewportStore } from '../store/viewport';
import { SHINKAI_STORE_URL } from '../utils/store';

export const ToolsHomepage = () => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const form = useToolForm();
  const toolHomepageScrollPositionRef = usePlaygroundStore(
    (state) => state.toolHomepageScrollPositionRef,
  );
  const resetPlaygroundStore = usePlaygroundStore(
    (state) => state.resetPlaygroundStore,
  );
  const { data: llmProviders } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const currentAI = form.watch('llmProviderId');

  const currentAIModel = llmProviders?.find(
    (provider) => provider.id === currentAI,
  );

  const isCodeGeneratorModel =
    currentAIModel?.model.toLowerCase() ===
    CODE_GENERATOR_MODEL_ID.toLowerCase();

  useEffect(() => {
    resetPlaygroundStore();
  }, [resetPlaygroundStore]);

  useEffect(() => {
    const genCodeModel = llmProviders?.find(
      (provider) =>
        provider.model.toLowerCase() === CODE_GENERATOR_MODEL_ID.toLowerCase(),
    );
    if (genCodeModel) {
      form.setValue('llmProviderId', genCodeModel.id);
    }
  }, [form, llmProviders]);

  const scrollElementRef = useRef<HTMLDivElement>(null);
  useScrollRestoration({
    key: 'tools',
    containerRef: scrollElementRef,
    scrollTopStateRef: toolHomepageScrollPositionRef,
  });

  const {
    currentStep,
    toolCode,
    toolCodeStatus,
    toolMetadata,
    toolMetadataStatus,
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
    requireFeedbackFlow: isCodeGeneratorModel,
  });

  const chatInboxId = usePlaygroundStore((state) => state.chatInboxId);

  useEffect(() => {
    if (error) {
      resetPlaygroundStore();
    }
  }, [error, resetPlaygroundStore]);

  const renderStep = () => {
    if (
      currentStep === ToolCreationState.CREATING_CODE ||
      currentStep === ToolCreationState.CREATING_METADATA ||
      currentStep === ToolCreationState.SAVING_TOOL ||
      currentStep === ToolCreationState.COMPLETED
    )
      return (
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
            <ToolCreationStatus
              currentStep={currentStep}
              error={error ?? ''}
              isSavingTool={currentStep === ToolCreationState.SAVING_TOOL}
              language={form.watch('language')}
              toolCode={toolCode}
              toolCodeStatus={toolCodeStatus}
              toolMetadataStatus={toolMetadataStatus}
              toolMetadataString={JSON.stringify(toolMetadata, null, 2)}
            />
          }
          topElement={
            <div className="flex h-[45px] items-center justify-between gap-2 border-b border-gray-400 px-4 pb-2.5">
              <div className="flex items-center gap-2">
                <Button
                  className="size-6 p-1"
                  onClick={() => resetPlaygroundStore()}
                  size="auto"
                  variant="tertiary"
                >
                  <LogOut className="size-full text-white" />
                </Button>

                <Skeleton className="bg-official-gray-900 h-[30px] w-[200px]" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="bg-official-gray-900 h-[30px] w-[100px]" />
                <Skeleton className="bg-official-gray-900 h-[30px] w-[40px]" />
                <Skeleton className="bg-official-gray-900 h-[30px] w-[100px]" />
              </div>
            </div>
          }
        />
      );

    return (
      <ToolsHome
        error={error}
        form={form}
        isCodeGeneratorModel={isCodeGeneratorModel}
        isProcessing={currentStep !== ToolCreationState.PROMPT_INPUT}
        startToolCreation={startToolCreation}
      />
    );
  };

  return <>{renderStep()}</>;
};

function ToolsHome({
  startToolCreation,
  error,
  isProcessing,
  form,
  isCodeGeneratorModel,
}: {
  startToolCreation: (form: any) => void;
  error: string | null;
  isProcessing: boolean;
  isCodeGeneratorModel: boolean;
  form: UseFormReturn<CreateToolCodeFormSchema>;
}) {
  const { t } = useTranslation();

  const auth = useAuth((state) => state.auth);
  const toolHomepageScrollPositionRef = usePlaygroundStore(
    (state) => state.toolHomepageScrollPositionRef,
  );

  const xShinkaiToolId = usePlaygroundStore((state) => state.xShinkaiToolId);
  const xShinkaiAppId = usePlaygroundStore((state) => state.xShinkaiAppId);

  const mainLayoutContainerRef = useViewportStore(
    (state) => state.mainLayoutContainerRef,
  );

  useScrollRestoration({
    key: 'tools',
    containerRef: mainLayoutContainerRef,
    scrollTopStateRef: toolHomepageScrollPositionRef,
  });

  const defaulAgentId = useSettings((state) => state.defaultAgentId);

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

  return (
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
                              form.setValue('language', value as CodeLanguage);
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
                            onClick={() => startToolCreation(form.getValues())}
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
                    onSubmit={() => {
                      startToolCreation(form.getValues());
                    }}
                    placeholder={'Describe the tool you want to create...'}
                    textareaClassName="max-h-[40vh] min-h-[120px] p-4 text-sm"
                    value={form.watch('message')}
                  />
                  {error && (
                    <div className="mt-3 flex max-w-full items-start gap-2 rounded-md bg-[#2d0607]/40 px-3 py-2.5 text-xs font-medium text-[#ff9ea1]">
                      <CircleAlert className="mt-1 size-4 shrink-0" />
                      <div className="flex flex-1 flex-col gap-0.5">
                        <div className="-ml-2.5 w-full shrink-0 truncate rounded-full px-2.5 py-1 text-xs">
                          Failed to generate tool. You might want to try using a
                          more powerful AI model for better results.
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
                        <ToolsIcon className="mr-1 size-4" />
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
  );
}
