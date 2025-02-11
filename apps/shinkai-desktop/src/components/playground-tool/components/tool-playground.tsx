import { FormProps } from '@rjsf/core';
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
import { CodePanel } from './code-panel';
import { ExecutionPanel } from './execution-panel';
import { ManageSourcesButton } from './manage-sources-button';
import { MetadataPanel } from './metadata-panel';
import { PlaygroundChat } from './playground-chat';

// export const languageIconMap = {
//   python: <PythonIcon />,
//   javascript: <JavaScriptIcon />,
//   typescript: <TypeScriptIcon />,
//   go: <GoIcon />,

// };

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
            <div className="flex size-full flex-col gap-2">
              <div className="flex shrink-0 items-center justify-between gap-2">
                <TabsList className="grid grid-cols-2 rounded-lg border border-gray-400 bg-transparent p-0.5">
                  <TabsTrigger
                    className="font-regular flex h-8 items-center gap-1.5 text-xs"
                    value="code"
                  >
                    <svg
                      className="size-4"
                      fill="none"
                      height="24"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path
                        d="M18 16L19.8398 17.5858C20.6133 18.2525 21 18.5858 21 19C21 19.4142 20.6133 19.7475 19.8398 20.4142L18 22"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M14 16L12.1602 17.5858C11.3867 18.2525 11 18.5858 11 19C11 19.4142 11.3867 19.7475 12.1602 20.4142L14 22"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M20 13.0032L20 7.8199C20 6.12616 20 5.27929 19.732 4.60291C19.3013 3.51555 18.3902 2.65784 17.2352 2.25228C16.5168 2 15.6173 2 13.8182 2C10.6698 2 9.09563 2 7.83836 2.44148C5.81714 3.15122 4.22281 4.6522 3.46894 6.55509C3 7.73875 3 9.22077 3 12.1848L3 14.731C3 17.8013 3 19.3364 3.8477 20.4025C4.09058 20.708 4.37862 20.9792 4.70307 21.2078C5.61506 21.8506 6.85019 21.9757 9 22"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M3 12C3 10.159 4.49238 8.66667 6.33333 8.66667C6.99912 8.66667 7.78404 8.78333 8.43137 8.60988C9.00652 8.45576 9.45576 8.00652 9.60988 7.43136C9.78333 6.78404 9.66667 5.99912 9.66667 5.33333C9.66667 3.49238 11.1591 2 13 2"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                    </svg>
                    Code
                  </TabsTrigger>
                  <TabsTrigger
                    className="flex h-8 items-center gap-1.5 text-xs font-semibold"
                    value="preview"
                  >
                    Metadata
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
                  <div className="flex items-center gap-2.5">
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
                  </div>
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
                  <ResizableHandle className="my-4 bg-gray-300" withHandle />

                  <ResizablePanel className="flex flex-col">
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
