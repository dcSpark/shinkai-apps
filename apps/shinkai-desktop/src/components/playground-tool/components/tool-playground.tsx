import { ReloadIcon } from '@radix-ui/react-icons';
import { FormProps } from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  CodeLanguage,
  ToolMetadata,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';
import {
  Badge,
  Button,
  ChatInputArea,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  JsonForm,
  MessageList,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { SendIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  Loader2,
  LucideArrowLeft,
  Play,
  Redo2Icon,
  Save,
  Undo2Icon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, To } from 'react-router-dom';

import { useAuth } from '../../../store/auth';
import { AIModelSelector } from '../../chat/chat-action-bar/ai-update-selection-action-bar';
import { ToolErrorFallback } from '../error-boundary';
import {
  CreateToolCodeFormSchema,
  useToolCode,
  useToolForm,
} from '../hooks/use-tool-code';
import { useToolMetadata } from '../hooks/use-tool-metadata';
import PlaygroundToolLayout from '../layout';
import ToolCodeEditor from '../tool-code-editor';
import { detectLanguage } from '../utils/code';
import { LanguageToolSelector } from './language-tool-selector';
import { ToolsSelection } from './tools-selection';

function PlaygroundToolEditor({
  mode,
  createToolCodeFormInitialValues,
  toolCodeInitialValues,
  toolMetadataInitialValues,
  initialChatInboxId,
  toolName,
}: {
  mode: 'create' | 'edit';
  createToolCodeFormInitialValues?: Partial<CreateToolCodeFormSchema>;
  toolMetadataInitialValues?: {
    metadata: ToolMetadata | null;
    state?: 'idle' | 'pending' | 'success' | 'error';
    error?: string | null;
  };
  toolCodeInitialValues?: {
    code: string;
    state?: 'idle' | 'pending' | 'success' | 'error';
    error?: string | null;
  };
  toolName?: string;
  initialChatInboxId?: string;
}) {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();
  const toolResultBoxRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState(null);

  const form = useToolForm(createToolCodeFormInitialValues);

  useEffect(() => {
    if (createToolCodeFormInitialValues?.language) {
      form.setValue('language', createToolCodeFormInitialValues.language);
    }
  }, [form]);

  const {
    chatInboxId,
    toolCode,
    baseToolCodeRef,
    isToolCodeGenerationPending,
    isToolCodeGenerationSuccess,
    fetchPreviousPage,
    hasPreviousPage,
    isChatConversationLoading,
    isFetchingPreviousPage,
    isChatConversationSuccess,
    chatConversationData,
    toolHistory,
    codeEditorRef,
    metadataEditorRef,
    executeToolCodeQuery,
    toolResult,
    isDirtyCodeEditor,
    setIsDirtyCodeEditor,
    forceGenerateMetadata,
    resetCounter,
    restoreCode,
    handleApplyChangesCodeSubmit,
    isRestoringToolConversation,
    goPreviousToolCode,
    goNextToolCode,
    isSavingTool,
    handleSaveTool,
    resetToolCode,
    handleCreateToolCode,
    xShinkaiAppId,
    xShinkaiToolId,
  } = useToolCode({
    createToolCodeForm: form,
    initialState: toolCodeInitialValues,
    initialChatInboxId,
  });

  const {
    isMetadataGenerationPending,
    isMetadataGenerationSuccess,
    isMetadataGenerationIdle,
    metadataGenerationData,
    metadataGenerationError,
    isMetadataGenerationError,
    regenerateToolMetadata,
  } = useToolMetadata({
    chatInboxId,
    toolCode,
    tools: form.watch('tools'),
    forceGenerateMetadata,
    initialState: toolMetadataInitialValues,
  });

  const handleRunCode: FormProps['onSubmit'] = async (data) => {
    const { configs, params } = data.formData;
    const updatedCodeWithoutSave = codeEditorRef.current?.value ?? '';
    await executeToolCodeQuery.mutateAsync({
      code: isDirtyCodeEditor ? updatedCodeWithoutSave : toolCode,
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      params,
      llmProviderId: form.getValues('llmProviderId'),
      tools: form.getValues('tools'),
      language: form.getValues('language'),
      configs,
      xShinkaiAppId,
      xShinkaiToolId,
    });
  };

  return (
    <PlaygroundToolLayout
      leftElement={
        <>
          <div className="flex items-center gap-3 px-2">
            <Link to={-1 as To}>
              <LucideArrowLeft className="text-gray-80 size-[18px]" />
              <span className="sr-only">{t('common.back')}</span>
            </Link>
            <h1 className="py-2 text-sm font-bold tracking-tight">
              {mode === 'create' ? 'Tool Playground' : `Edit ${toolName}`}
            </h1>
          </div>
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
                      text: 'Tool for downloading a website content in markdown',
                      prompt:
                        'Generate a tool for downloading a website into markdown',
                    },
                    {
                      text: 'Tool for getting tech-related stories from Hacker News',
                      prompt:
                        'Generate a tool for getting top tech-related stories from Hacker News, include the title, author, and URL of the story',
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
                hidePythonExecution={true}
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
                                form.setValue(
                                  'language',
                                  value as CodeLanguage,
                                );
                              }}
                              value={form.watch('language')}
                            />
                            <ToolsSelection form={form} />
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
                                    isToolCodeGenerationPending ||
                                    isMetadataGenerationPending ||
                                    !form.watch('message')
                                  }
                                  onClick={form.handleSubmit(
                                    handleCreateToolCode,
                                  )}
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
          defaultValue="code"
        >
          <div className={'flex flex-grow justify-stretch'}>
            <div className="flex size-full flex-col gap-2">
              <div className="flex shrink-0 items-center justify-between gap-2">
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
                <div className="flex items-center gap-6">
                  {toolHistory.length > 1 && (
                    <div className="flex items-center gap-4">
                      {toolCode === toolHistory?.at(-1)?.code ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              className="border-cyan-600 bg-cyan-900/20 font-normal text-cyan-400"
                              variant="inputAdornment"
                            >
                              Latest
                            </Badge>
                          </TooltipTrigger>
                          <TooltipPortal>
                            <TooltipContent side="bottom">
                              <p>This is your latest version</p>
                            </TooltipContent>
                          </TooltipPortal>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              className="bg-gray-350 cursor-pointer border-0 px-2.5 py-2 hover:bg-gray-400"
                              onClick={restoreCode}
                              variant="secondary"
                            >
                              {isRestoringToolConversation ? (
                                <Loader2
                                  className={cn('mr-2 h-4 w-4 animate-spin')}
                                />
                              ) : null}
                              <span>Restore</span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipPortal>
                            <TooltipContent className="max-w-sm" side="bottom">
                              <p>
                                Restore to this version. This action will undo
                                all changes made since the selected version
                              </p>
                            </TooltipContent>
                          </TooltipPortal>
                        </Tooltip>
                      )}
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger
                            asChild
                            disabled={toolCode === toolHistory?.at(0)?.code}
                          >
                            <Button
                              className="size-[30px] rounded-lg p-1 disabled:pointer-events-none disabled:bg-transparent disabled:text-gray-100"
                              onClick={goPreviousToolCode}
                              size="auto"
                              variant="ghost"
                            >
                              <Undo2Icon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipPortal>
                            <TooltipContent side="bottom">
                              <p>View previous version</p>
                            </TooltipContent>
                          </TooltipPortal>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger
                            asChild
                            disabled={toolCode === toolHistory?.at(-1)?.code}
                          >
                            <Button
                              className="size-[30px] rounded-lg p-1 disabled:pointer-events-none disabled:bg-transparent disabled:text-gray-100"
                              onClick={goNextToolCode}
                              size="auto"
                              variant="ghost"
                            >
                              <Redo2Icon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipPortal>
                            <TooltipContent side="bottom">
                              <p>View next version</p>
                            </TooltipContent>
                          </TooltipPortal>
                        </Tooltip>
                      </div>
                    </div>
                  )}
                  <Button
                    className="text-gray-80 h-[30px] shrink-0 rounded-md text-xs"
                    disabled={
                      !toolCode ||
                      !metadataGenerationData ||
                      !chatInboxId ||
                      isSavingTool
                    }
                    isLoading={isSavingTool}
                    onClick={handleSaveTool}
                    size="sm"
                    variant="outline"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Tool
                  </Button>
                </div>
              </div>
              <TabsContent
                className="mt-0 flex-1 space-y-4 overflow-y-auto whitespace-pre-line break-words data-[state=inactive]:hidden"
                forceMount
                value="code"
              >
                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel
                    className="flex flex-col"
                    defaultSize={60}
                    maxSize={70}
                    minSize={30}
                  >
                    <div className="flex size-full min-h-[220px] flex-col rounded-lg bg-gray-300 pb-4 pl-4 pr-3">
                      <div className="flex h-full flex-col">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-gray-80 flex flex-col gap-1 py-3 text-xs">
                            <h2 className="flex items-center gap-2 font-mono font-semibold text-gray-50">
                              Code{' '}
                            </h2>
                            {toolCode && (
                              <p>
                                {/* eslint-disable-next-line react/no-unescaped-entities */}
                                Here's the code generated by Shinkai AI based on
                                your prompt.
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
                        <div className="flex-1 overflow-auto">
                          {isToolCodeGenerationPending && (
                            <div className="text-gray-80 flex flex-col items-center gap-2 py-4 text-xs">
                              <Loader2 className="shrink-0 animate-spin" />
                              Generating Code...
                            </div>
                          )}
                          {!isToolCodeGenerationPending &&
                            !toolCode &&
                            !isToolCodeGenerationSuccess && (
                              <p className="text-gray-80 pt-6 text-center text-xs">
                                No code generated yet. <br />
                                Ask Shinkai AI to generate your tool code.
                              </p>
                            )}
                          {isToolCodeGenerationSuccess && toolCode && (
                            <form
                              className="flex size-full flex-col"
                              key={resetCounter}
                              onSubmit={handleApplyChangesCodeSubmit}
                            >
                              <div className="flex h-[45px] shrink-0 items-center justify-between rounded-t-lg border-b border-gray-400 bg-[#0d1117] px-3 py-2">
                                <span className="inline-flex items-center gap-2 pl-3 text-xs font-medium text-gray-50">
                                  {' '}
                                  {detectLanguage(toolCode)}{' '}
                                  {isDirtyCodeEditor && (
                                    <span className="size-2 shrink-0 rounded-full bg-orange-500" />
                                  )}
                                </span>
                                <AnimatePresence mode="popLayout">
                                  {isDirtyCodeEditor && (
                                    <motion.div
                                      animate={{ opacity: 1 }}
                                      className="flex items-center justify-end gap-2"
                                      exit={{ opacity: 0 }}
                                      initial={{ opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <Button
                                        className="!h-[32px] min-w-[80px] rounded-xl"
                                        onClick={resetToolCode}
                                        size="sm"
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
                                  setIsDirtyCodeEditor(
                                    currentCode !== baseToolCodeRef.current,
                                  );
                                }}
                                ref={codeEditorRef}
                                value={toolCode}
                              />
                            </form>
                          )}
                        </div>
                      </div>
                    </div>
                  </ResizablePanel>
                  <ResizableHandle className="my-4 bg-gray-300" withHandle />

                  <ResizablePanel className="flex flex-col">
                    <div className="flex size-full min-h-[220px] flex-col rounded-lg bg-gray-300 pb-4 pl-4 pr-3">
                      <div className="flex items-center justify-between">
                        <div className="text-gray-80 flex flex-col gap-1 py-3 text-xs">
                          <h2 className="flex font-mono font-semibold text-gray-50">
                            Run
                          </h2>
                          {metadataGenerationData && (
                            <p>Fill in the options above to run your tool.</p>
                          )}
                        </div>
                        {isMetadataGenerationSuccess &&
                          !isToolCodeGenerationPending &&
                          !isMetadataGenerationError && (
                            <Button
                              className="h-[30px] rounded-lg border-gray-200 text-white"
                              form="parameters-form"
                              isLoading={executeToolCodeQuery.isPending}
                              size="sm"
                              variant="ghost"
                            >
                              {!executeToolCodeQuery.isPending && (
                                <Play className="mr-2 h-4 w-4" />
                              )}
                              Run
                            </Button>
                          )}
                      </div>
                      <div className="flex-1 overflow-auto">
                        {(isMetadataGenerationPending ||
                          isToolCodeGenerationPending) && (
                          <div className="text-gray-80 flex flex-col items-center gap-2 py-4 text-xs">
                            <Loader2 className="shrink-0 animate-spin" />
                            Generating...
                          </div>
                        )}
                        {!isMetadataGenerationPending &&
                          !isToolCodeGenerationPending &&
                          isMetadataGenerationError && (
                            <ToolErrorFallback
                              error={new Error(metadataGenerationError ?? '')}
                              resetErrorBoundary={regenerateToolMetadata}
                            />
                          )}
                        {isMetadataGenerationSuccess &&
                          !isToolCodeGenerationPending &&
                          !isMetadataGenerationError && (
                            <div className="text-gray-80 size-full text-xs">
                              <JsonForm
                                className="py-4"
                                formData={formData}
                                id="parameters-form"
                                noHtml5Validate={true}
                                onChange={(e) => setFormData(e.formData)}
                                onSubmit={handleRunCode}
                                schema={{
                                  type: 'object',
                                  properties: {
                                    ...(metadataGenerationData?.configurations
                                      ?.properties &&
                                    Object.keys(
                                      metadataGenerationData.configurations
                                        .properties,
                                    ).length > 0
                                      ? {
                                          configs:
                                            metadataGenerationData.configurations,
                                        }
                                      : {}),
                                    ...(metadataGenerationData?.parameters
                                      ?.properties &&
                                    Object.keys(
                                      metadataGenerationData.parameters
                                        .properties,
                                    ).length > 0
                                      ? {
                                          params:
                                            metadataGenerationData.parameters,
                                        }
                                      : {}),
                                  },
                                }}
                                uiSchema={{
                                  'ui:submitButtonOptions': { norender: true },
                                  configs: {
                                    'ui:title': 'Config',
                                  },
                                  params: {
                                    'ui:title': 'Inputs',
                                  },
                                }}
                                validator={validator}
                              />
                              <AnimatePresence>
                                {(executeToolCodeQuery.isPending ||
                                  executeToolCodeQuery.isError ||
                                  executeToolCodeQuery.isSuccess) && (
                                  <motion.div
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex flex-col overflow-x-hidden border-t border-gray-200 bg-gray-300 pt-2"
                                    exit={{ opacity: 0, x: 20 }}
                                    initial={{ opacity: 0, x: 20 }}
                                  >
                                    {executeToolCodeQuery.isPending && (
                                      <div className="text-gray-80 flex flex-col items-center gap-2 py-4 text-xs">
                                        <Loader2 className="shrink-0 animate-spin" />
                                        Running Tool...
                                      </div>
                                    )}
                                    {executeToolCodeQuery.isError && (
                                      <div className="mt-2 flex flex-col items-center gap-2 bg-red-900/20 px-3 py-4 text-xs text-red-400">
                                        <p>
                                          Tool execution failed. Try generating
                                          the tool code again.
                                        </p>
                                        <pre className="whitespace-break-spaces px-4 text-center">
                                          {executeToolCodeQuery.error?.response
                                            ?.data?.message ??
                                            executeToolCodeQuery.error?.message}
                                        </pre>
                                      </div>
                                    )}
                                    <div ref={toolResultBoxRef}>
                                      {executeToolCodeQuery.isSuccess &&
                                        toolResult && (
                                          <ToolCodeEditor
                                            language="json"
                                            readOnly
                                            value={JSON.stringify(
                                              toolResult,
                                              null,
                                              2,
                                            )}
                                          />
                                        )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        {isMetadataGenerationIdle &&
                          !isToolCodeGenerationPending && (
                            <div>
                              <p className="text-gray-80 py-4 pt-6 text-center text-xs">
                                No metadata generated yet.
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </TabsContent>
              <TabsContent
                className="mt-0 flex-1 space-y-4 overflow-y-auto whitespace-pre-line break-words data-[state=inactive]:hidden"
                forceMount
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
                    !isToolCodeGenerationPending &&
                    isMetadataGenerationError && (
                      <ToolErrorFallback
                        error={new Error(metadataGenerationError ?? '')}
                        resetErrorBoundary={regenerateToolMetadata}
                      />
                    )}

                  {isMetadataGenerationSuccess &&
                    !isMetadataGenerationError && (
                      <div className="text-gray-80 text-xs">
                        <div className="py-2">
                          <ToolCodeEditor
                            language="json"
                            ref={metadataEditorRef}
                            style={{ height: '80vh' }}
                            value={
                              metadataGenerationData != null
                                ? JSON.stringify(
                                    metadataGenerationData,
                                    null,
                                    2,
                                  )
                                : 'Invalid metadata'
                            }
                          />
                        </div>
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

export default PlaygroundToolEditor;
