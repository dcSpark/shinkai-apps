import { DialogClose } from '@radix-ui/react-dialog';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { type CodeLanguage } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useOpenToolInCodeEditor } from '@shinkai_network/shinkai-node-state/v2/mutations/openToolnCodeEditor/useOpenToolInCodeEditor';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import { useGetToolProtocols } from '@shinkai_network/shinkai-node-state/v2/queries/getToolProtocols/useGetToolProtocols';
import {
  BackgroundBeams,
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChatInputArea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@shinkai_network/shinkai-ui';
import { SendIcon, ToolsIcon } from '@shinkai_network/shinkai-ui/assets';
import { useScrollRestoration } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  CircleAlert,
  ExternalLink,
  LogOut,
  StoreIcon,
  XIcon,
} from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { Link } from 'react-router';
import { toast } from 'sonner';

import ProviderIcon from '../components/ais/provider-icon';
import { MessageList } from '../components/chat/components/message-list';
import { FeedbackModal } from '../components/feedback/feedback-modal';
import { LanguageToolSelector } from '../components/playground-tool/components/language-tool-selector';
import { ToolsSelection } from '../components/playground-tool/components/tools-selection';
import {
  ToolCreationState,
  usePlaygroundStore,
} from '../components/playground-tool/context/playground-context';
import {
  type CreateToolCodeFormSchema,
  useToolForm,
} from '../components/playground-tool/hooks/use-tool-code';
import { useToolFlow } from '../components/playground-tool/hooks/use-tool-flow';
import PlaygroundToolLayout from '../components/playground-tool/layout';
import ToolCreationStatus from '../components/tools/components/tool-creation-status';
import {
  CODE_GENERATOR_MODEL_ID,
  SHINKAI_FREE_TRIAL_MODEL_ID,
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

export type ModelOption = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
};

function AIModelSelectorBase({
  selectedModelId,
  onModelSelect,
}: {
  selectedModelId: string;
  onModelSelect: (modelId: string) => void;
}) {
  const auth = useAuth((state) => state.auth);

  const { llmProviders } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const modelOptions = useMemo(() => {
    const codeGeneratorModel = llmProviders?.find(
      (provider) =>
        provider.model.toLowerCase() === CODE_GENERATOR_MODEL_ID.toLowerCase(),
    );

    const freeTrialModel = llmProviders?.find(
      (provider) =>
        provider.model.toLowerCase() ===
        SHINKAI_FREE_TRIAL_MODEL_ID.toLowerCase(),
    );

    if (!codeGeneratorModel || !freeTrialModel) {
      return [];
    }

    return [
      {
        id: codeGeneratorModel?.id ?? '',
        name: 'Shinkai Code Generator',
        placeholderId: 'code-generator',
        description:
          'Builds tools using our specialized AI code-generation tool.',
      },
      {
        id: freeTrialModel?.id ?? '',
        name: 'Shinkai Free Trial',
        placeholderId: 'free-trial',
        description:
          'Great for building tools, works with any content you provide.',
        recommendation: 'manually copy and paste the documentation that the AI requires and place it inside <documentation></documentation>.',
      },
      {
        id: 'custom-model',
        name: 'Custom Model',
        placeholderId: 'custom-model',
        description: 'Choose your preferred AI model for your specific needs.',
        model: 'custom-model',
      },
    ];
  }, [llmProviders]);

  const customModelOptions = useMemo(
    () =>
      llmProviders?.filter(
        (provider) =>
          provider.model.toLowerCase() !==
            CODE_GENERATOR_MODEL_ID.toLowerCase() &&
          provider.model.toLowerCase() !==
            SHINKAI_FREE_TRIAL_MODEL_ID.toLowerCase(),
      ),
    [llmProviders],
  );

  const isSpecificCustomModel = customModelOptions.some(
    (model) => model.id === selectedModelId,
  );

  const [customModel, setCustomModel] = useState(
    customModelOptions?.[0]?.id ?? '',
  );

  const handleCustomModelSelect = (value: string) => {
    setCustomModel(value);
    onModelSelect(value);
  };

  const isCustomModelCategory = selectedModelId === 'custom-model';

  return (
    <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-3">
      {modelOptions.map((model) => {
        const isSelected =
          model.id === 'custom-model'
            ? isCustomModelCategory || isSpecificCustomModel
            : selectedModelId === model.id;

        return (
          <Card
            className={cn(
              'border-official-gray-780 bg-official-gray-900 hover:bg-official-gray-850 flex cursor-pointer flex-col gap-2.5 border p-4 transition-all',
              isSelected
                ? 'ring-official-gray-600 border-official-gray-780 bg-official-gray-850 ring-1'
                : '',
            )}
            key={model.id}
            onClick={() => {
              if (model.id !== 'custom-model') {
                onModelSelect(model?.id ?? '');
              } else if (!isCustomModelCategory && !isSpecificCustomModel) {
                onModelSelect(customModel);
              }
            }}
          >
            <CardHeader className="p-0">
              <div className="flex items-center space-x-2">
                <div
                  className={cn(
                    'flex size-6 items-center justify-center rounded-md',
                    isSelected ? 'text-white' : 'text-official-gray-400',
                  )}
                >
                  <ProviderIcon
                    className="mx-1 size-4"
                    provider={model?.model?.split(':')[0] ?? ''}
                  />
                </div>
                <CardTitle className="text-official-gray-100 text-base font-medium">
                  {model?.name}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-0">
              <CardDescription className="text-official-gray-400 text-sm">
                {model.description}
                {model.recommendation && (
                  <>
                    <br />
                    <br />
                    <span className="font-semibold">Recommendation:</span>{' '}
                    {model.recommendation}
                  </>
                )}
              </CardDescription>
              {model.placeholderId === 'code-generator' && (
                <SupportedProtocols />
              )}
              {model.placeholderId === 'custom-model' && (
                <Select
                  onValueChange={handleCustomModelSelect}
                  value={isSpecificCustomModel ? selectedModelId : customModel}
                >
                  <SelectTrigger
                    className={cn(
                      'bg-official-gray-900 hover:bg-official-gray-800 flex !h-auto !w-auto max-w-[300px] items-center justify-between border py-2 pr-10 focus:ring-0 [&>svg]:top-[10px]',
                      isSelected ? 'text-white' : 'text-official-gray-400',
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent className="border-official-gray-780 bg-official-gray-900 text-official-gray-100">
                    {customModelOptions.map((option) => (
                      <SelectItem
                        className="hover:bg-official-gray-800 focus:bg-official-gray-800 focus:text-official-gray-100"
                        key={option.id}
                        value={option.id}
                      >
                        {option.name ?? option.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

const AIModelSelector = memo(AIModelSelectorBase);

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
    <div className="container max-w-[1100px] pb-[80px]">
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
          <FeedbackModal />
        </div>
      </div>
      <div className="flex max-w-[1100px] flex-col gap-4">
        <div className="flex flex-col gap-20">
          <div className="flex min-h-[300px] w-full flex-col items-center justify-between gap-6 pt-2">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col items-center">
                <h1 className="font-clash text-center text-4xl font-medium text-white">
                  Build AI Tools in Minutes
                </h1>
                <p className="text-official-gray-400 text-center text-sm">
                  Create, automate, and optimize your workflow with powerful AI
                  tools.
                </p>
              </div>
            </div>

            <div className="flex w-full max-w-[1100px] flex-col gap-4">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="bg-official-gray-900 border-official-gray-700 rounded-full border px-3 py-1 text-xs font-semibold text-white">
                    Step 1
                  </span>
                  <span className="text-base font-medium text-white">
                    Select your model
                  </span>
                </div>
                <div className="p-2">
                  <AIModelSelector
                    onModelSelect={(value) => {
                      form.setValue('llmProviderId', value);
                    }}
                    selectedModelId={form.watch('llmProviderId')}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="bg-official-gray-900 border-official-gray-700 rounded-full border px-3 py-1 text-xs font-semibold text-white">
                    Step 2
                  </span>
                  <span className="text-base font-medium text-white">
                    Write your requirements
                  </span>
                </div>
                <div className="p-2">
                  <Form {...form}>
                    <form>
                      <div className="relative pb-10">
                        <ChatInputArea
                          autoFocus
                          bottomAddons={
                            <div className="flex items-end justify-between gap-3 px-3 pb-2">
                              <div className="flex items-center gap-3">
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
                                      void openToolInCodeEditor({
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
                                    startToolCreation(form.getValues())
                                  }
                                  size="icon"
                                  type="button"
                                >
                                  <SendIcon className="h-full w-full" />
                                  <span className="sr-only">
                                    {t('chat.sendMessage')}
                                  </span>
                                </Button>
                              </div>
                            </div>
                          }
                          className="relative z-[1]"
                          disabled={isProcessing}
                          onChange={(value) => {
                            form.setValue('message', value);
                          }}
                          onSubmit={() => {
                            startToolCreation(form.getValues());
                          }}
                          placeholder={
                            'Describe the tool you want to create...'
                          }
                          textareaClassName="max-h-[200px] min-h-[200px] p-4 text-sm"
                          value={form.watch('message')}
                        />
                        <ChatBoxFooter />
                      </div>
                      {error && (
                        <div className="mt-3 flex max-w-full items-start gap-2 rounded-md bg-[#2d0607]/40 px-3 py-2.5 text-xs font-medium text-[#ff9ea1]">
                          <CircleAlert className="mt-1 size-4 shrink-0" />
                          <div className="flex flex-1 flex-col gap-0.5">
                            <div className="-ml-2.5 w-full shrink-0 truncate rounded-full px-2.5 py-1 text-xs">
                              Failed to generate tool. You might want to try
                              using a more powerful AI model for better results.
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
            </div>
          </div>

          <ToolCollection />

          <div className="bg-official-gray-1100 relative rounded-lg">
            <div className="relative z-[1] mx-auto flex max-w-[1400px] flex-col items-center gap-8 p-10 text-center">
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
                <div className="flex items-center gap-3">
                  <a
                    className={cn(buttonVariants({ size: 'sm' }), 'gap-4 px-4')}
                    href={SHINKAI_STORE_URL}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Visit App Store <ArrowRight className="h-4 w-4" />
                  </a>
                  <FeedbackModal buttonProps={{ rounded: 'full' }} />
                </div>
              </div>
            </div>
            <BackgroundBeams />
          </div>
        </div>
      </div>
    </div>
  );
}

const ChatBoxFooterBase = () => {
  return (
    <div
      className={cn(
        'bg-official-gray-850 absolute inset-x-2 bottom-1 flex h-[40px] justify-between gap-2 rounded-b-xl px-2 pb-1 pt-2.5 shadow-white',
      )}
    >
      <div className="text-official-gray-400 flex w-full items-center justify-between gap-2 px-2">
        <span className="text-xs font-light">
          <span className="font-medium">Shift + Enter</span> for a new line
        </span>

        <span className="text-xs font-light">
          <span className="font-medium">Enter</span> to send
        </span>
      </div>
    </div>
  );
};
const ChatBoxFooter = memo(ChatBoxFooterBase);

function SupportedProtocols() {
  const { data: toolProtocols, isPending } = useGetToolProtocols();

  return (
    <Dialog>
      <DialogTrigger className="text-official-gray-300 hover:text-official-gray-200 flex items-center gap-1 text-sm transition-colors">
        <div className="border-official-gray-300 border-b">
          Well Supported Protocols
        </div>
        <ArrowRight className="ml-0.5 h-3 w-3" />
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogClose asChild>
          <Button
            className="absolute right-4 top-4"
            size="icon"
            variant="tertiary"
          >
            <XIcon className="text-gray-80 h-5 w-5" />
          </Button>
        </DialogClose>
        <DialogHeader>
          <DialogTitle className="text-xl">Verified Protocols</DialogTitle>
        </DialogHeader>

        {isPending ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                className="bg-official-gray-900/30 h-[72px] animate-pulse rounded-lg"
                key={i}
              />
            ))}
          </div>
        ) : toolProtocols?.supported && toolProtocols?.supported.length > 0 ? (
          <div className="divide-official-gray-780 max-h-[500px] divide-y overflow-y-auto">
            {toolProtocols?.supported.map((protocol) => (
              <Link
                className="group flex items-center gap-3 px-3 py-2.5 transition-all duration-200"
                key={protocol.name}
                rel="noopener noreferrer"
                target="_blank"
                to={protocol.documentationURL}
              >
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-900 p-1.5">
                  <img
                    alt=""
                    className="size-full overflow-hidden rounded-full object-cover"
                    height={40}
                    src={protocol.icon}
                    width={40}
                  />
                </div>
                <div className="min-w-0 flex-grow">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-sm font-medium text-white">
                      {protocol.name}
                    </p>
                    <ExternalLink className="text-official-gray-500 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <div className="text-official-gray-400 mt-0.5 flex items-center text-xs">
                    <CheckCircle className="mr-1 h-3 w-3 text-green-400" />
                    <span className="truncate">Verified</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-official-gray-400 text-sm">
              No protocols found .
            </p>
          </div>
        )}

        <div className="border-official-gray-780 flex flex-col items-start justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
          <p className="text-official-gray-400 text-xs">
            Other protocols may also work but haven&apos;t been officially
            verified.
          </p>
          <FeedbackModal
            buttonLabel="Request Protocol"
            buttonProps={{ className: 'shrink-0' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
