import { FormProps } from '@rjsf/core';
import { CodeLanguage } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import {
  Badge,
  Button,
  Form,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  MetadataIcon,
  PythonIcon,
  TypeScriptIcon,
  UnknownLanguageIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Loader2, Redo2Icon, Save, Undo2Icon } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { useAuth } from '../../../store/auth';
import {
  CreateToolCodeFormSchema,
  useToolCode,
  useToolForm,
} from '../hooks/use-tool-code';
import { useToolMetadata } from '../hooks/use-tool-metadata';
import PlaygroundToolLayout from '../layout';
import { ToolMetadataSchemaType } from '../schemas';
import { detectLanguage } from '../utils/code';
import { CodePanel } from './code-panel';
import { ExecutionPanel } from './execution-panel';
import { LANGUAGE_TOOLS } from './language-tool-selector';
import { ManageSourcesButton } from './manage-sources-button';
import { MetadataPanel } from './metadata-panel';
import { PlaygroundChat } from './playground-chat';

export const getLanguageIcon = (currentLanguage: string) => {
  if (currentLanguage === 'Python') {
    return <PythonIcon className="size-4" />;
  }
  if (currentLanguage === 'TypeScript') {
    return <TypeScriptIcon className="size-4" />;
  }
  return <UnknownLanguageIcon className="size-4" />;
};

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
    metadata: ToolMetadataSchemaType | null;
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

  const form = useToolForm(createToolCodeFormInitialValues);

  useEffect(() => {
    if (createToolCodeFormInitialValues?.language) {
      form.setValue('language', createToolCodeFormInitialValues.language);
    }
  }, [createToolCodeFormInitialValues?.language, form]);

  const {
    chatInboxId,
    toolCode,
    baseToolCodeRef,
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
    toolResultFiles,
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
    initialToolName: toolMetadataInitialValues?.metadata?.name ?? '',
  });

  const { metadataGenerationData, regenerateToolMetadata } = useToolMetadata({
    chatInboxId,
    toolCode,
    tools: form.watch('tools'),
    forceGenerateMetadata,
    initialState: toolMetadataInitialValues,
  });

  const mountTimestamp = useRef(new Date());

  const handleRunCode: FormProps['onSubmit'] = async (data) => {
    mountTimestamp.current = new Date();
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
        <Form {...form}>
          <PlaygroundChat
            chatConversationData={chatConversationData}
            chatInboxId={chatInboxId ?? ''}
            fetchPreviousPage={fetchPreviousPage}
            handleCreateToolCode={handleCreateToolCode}
            hasPreviousPage={hasPreviousPage}
            isChatConversationLoading={isChatConversationLoading}
            isChatConversationSuccess={isChatConversationSuccess}
            isFetchingPreviousPage={isFetchingPreviousPage}
            mode={mode}
            toolName={toolName ?? ''}
          />
        </Form>
      }
      rightElement={
        <Tabs
          className="flex h-screen w-full flex-col overflow-hidden"
          defaultValue="code"
        >
          <div className={'flex flex-grow justify-stretch'}>
            <div className="flex size-full flex-col">
              <div className="flex w-full shrink-0 items-center justify-between gap-2 border-b border-gray-500">
                <TabsList className="grid h-8 grid-cols-2 rounded-none bg-transparent p-0">
                  <TabsTrigger
                    className={cn(
                      'rounded-xs relative flex size-full min-w-[120px] p-0 pt-0.5',
                      'data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-[0_2px_0_0_#16171a]',
                      'before:data-[state=active]:absolute before:data-[state=active]:left-0 before:data-[state=active]:right-0 before:data-[state=active]:top-0 before:data-[state=active]:h-0.5 before:data-[state=active]:bg-cyan-500',
                    )}
                    value="code"
                  >
                    <div className="flex size-full items-center justify-start gap-2 border-r border-gray-500 pl-3 pr-5 text-xs font-normal">
                      {getLanguageIcon(detectLanguage(toolCode))}
                      Code
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    className={cn(
                      'rounded-xs relative flex size-full p-0 pt-0.5',
                      'data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-[0_2px_0_0_#16171a]',
                      'before:data-[state=active]:absolute before:data-[state=active]:left-0 before:data-[state=active]:right-0 before:data-[state=active]:top-0 before:data-[state=active]:h-0.5 before:data-[state=active]:bg-cyan-500',
                    )}
                    value="preview"
                  >
                    <div className="flex size-full items-center justify-start gap-2 border-r border-gray-500 pl-3 pr-5 text-xs font-normal">
                      <MetadataIcon className="size-4 text-inherit" />
                      Metadata
                    </div>
                  </TabsTrigger>
                </TabsList>
                <div className="flex items-stretch gap-6">
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
                      <Separator
                        className="my-1 bg-gray-300"
                        orientation="vertical"
                      />
                    </div>
                  )}
                  {/* <div className="flex items-center gap-2.5">
                    <ManageSourcesButton
                      xShinkaiAppId={xShinkaiAppId}
                      xShinkaiToolId={xShinkaiToolId}
                    />
                    <Button
                      className="shrink-0"
                      disabled={
                        !toolCode ||
                        !metadataGenerationData ||
                        !chatInboxId ||
                        isSavingTool
                      }
                      isLoading={isSavingTool}
                      onClick={handleSaveTool}
                      rounded="lg"
                      size="xs"
                    >
                      <Save className="h-4 w-4" />
                      Save Tool
                    </Button>
                  </div> */}
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
                    minSize={0.3}
                  >
                    <CodePanel
                      baseToolCodeRef={baseToolCodeRef}
                      codeEditorRef={codeEditorRef}
                      handleApplyChangesCodeSubmit={
                        handleApplyChangesCodeSubmit
                      }
                      isDirtyCodeEditor={isDirtyCodeEditor}
                      resetCounter={resetCounter}
                      resetToolCode={resetToolCode}
                      setIsDirtyCodeEditor={setIsDirtyCodeEditor}
                    />
                  </ResizablePanel>
                  <ResizableHandle className="!h-1 bg-gray-500" />

                  <ResizablePanel className="flex flex-col" minSize={2.5}>
                    <ExecutionPanel
                      executionToolCodeError={
                        executeToolCodeQuery.error?.response?.data?.message ??
                        executeToolCodeQuery.error?.message
                      }
                      handleRunCode={handleRunCode}
                      isExecutionToolCodeError={executeToolCodeQuery.isError}
                      isExecutionToolCodePending={
                        executeToolCodeQuery.isPending
                      }
                      isExecutionToolCodeSuccess={
                        executeToolCodeQuery.isSuccess
                      }
                      mountTimestampRef={mountTimestamp}
                      regenerateToolMetadata={regenerateToolMetadata}
                      toolResultFiles={toolResultFiles}
                    />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </TabsContent>
              <TabsContent
                className="mt-0 flex-1 space-y-4 overflow-y-auto whitespace-pre-line break-words data-[state=inactive]:hidden"
                forceMount
                value="preview"
              >
                <MetadataPanel
                  metadataEditorRef={metadataEditorRef}
                  mode={mode}
                  regenerateToolMetadata={regenerateToolMetadata}
                />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      }
    />
  );
}

export default PlaygroundToolEditor;
