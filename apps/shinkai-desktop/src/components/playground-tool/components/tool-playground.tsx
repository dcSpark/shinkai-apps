/* eslint-disable react/jsx-sort-props */
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
import { usePlaygroundStore } from '../context/playground-context';
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
import { MetadataPanel } from './metadata-panel';
import { PlaygroundChat } from './playground-chat';
import { PlaygroundHeader } from './playground-header';

export const getLanguageIcon = (currentLanguage: string) => {
  if (currentLanguage === 'Python') {
    return <PythonIcon className="size-4" />;
  }
  if (currentLanguage === 'TypeScript') {
    return <TypeScriptIcon className="size-4" />;
  }
  return <UnknownLanguageIcon className="size-4" />;
};

export const tabTriggerClassnames = cn(
  'rounded-xs relative flex size-full min-w-[120px] p-0 pt-0.5',
  'data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-[0_2px_0_0_#1a1a1d]',
  'before:data-[state=active]:absolute before:data-[state=active]:left-0 before:data-[state=active]:right-0 before:data-[state=active]:top-0 before:data-[state=active]:h-0.5 before:data-[state=active]:bg-cyan-500',
);

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
    handleApplyChangesCodeSubmit,
    resetToolCode,
    handleCreateToolCode,
  } = useToolCode({
    createToolCodeForm: form,
    initialState: toolCodeInitialValues,
    initialChatInboxId,
  });

  const chatInboxId = usePlaygroundStore((state) => state.chatInboxId);
  const xShinkaiAppId = usePlaygroundStore((state) => state.xShinkaiAppId);
  const xShinkaiToolId = usePlaygroundStore((state) => state.xShinkaiToolId);

  const { regenerateToolMetadata } = useToolMetadata({
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
    <Form {...form}>
      <PlaygroundToolLayout
        topElement={
          <PlaygroundHeader
            toolHistory={toolHistory}
            mode={mode}
            toolName={toolName ?? ''}
            isExecutionToolCodePending={executeToolCodeQuery.isPending}
            baseToolCodeRef={baseToolCodeRef}
            metadataEditorRef={metadataEditorRef}
            codeEditorRef={codeEditorRef}
            initialToolName={toolMetadataInitialValues?.metadata?.name}
            initialChatInboxId={initialChatInboxId}
          />
        }
        leftElement={
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
        }
        rightElement={
          <div className={'flex flex-grow justify-stretch'}>
            <div className="flex size-full flex-col">
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={60} minSize={3}>
                  <Tabs className="flex size-full flex-col" defaultValue="code">
                    <div className="flex h-8 w-full shrink-0 items-center justify-between gap-2 border-b border-gray-400">
                      <TabsList className="grid h-full grid-cols-2 rounded-none bg-transparent p-0">
                        <TabsTrigger
                          className={cn(tabTriggerClassnames)}
                          value="code"
                        >
                          <div className="flex size-full items-center justify-start gap-2 border-r border-gray-400 pl-3 pr-5 text-xs font-normal">
                            {getLanguageIcon(detectLanguage(toolCode))}
                            Code
                          </div>
                        </TabsTrigger>
                        <TabsTrigger
                          className={cn(tabTriggerClassnames)}
                          value="metadata"
                        >
                          <div className="flex size-full items-center justify-start gap-2 border-r border-gray-400 pl-3 pr-5 text-xs font-normal">
                            <MetadataIcon className="size-4 text-inherit" />
                            Metadata
                          </div>
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent
                      className="mt-0 h-full space-y-4 overflow-y-auto whitespace-pre-line break-words data-[state=inactive]:hidden"
                      forceMount
                      value="code"
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
                    </TabsContent>
                    <TabsContent
                      className="mt-0 flex-1 space-y-4 overflow-y-auto whitespace-pre-line break-words data-[state=inactive]:hidden"
                      forceMount
                      value="metadata"
                    >
                      <MetadataPanel
                        metadataEditorRef={metadataEditorRef}
                        mode={mode}
                        regenerateToolMetadata={regenerateToolMetadata}
                      />
                    </TabsContent>
                  </Tabs>
                </ResizablePanel>
                <ResizableHandle className="bg-official-gray-1000 !h-1.5" />
                <ResizablePanel minSize={3}>
                  <ExecutionPanel
                    executionToolCodeError={
                      executeToolCodeQuery.error?.response?.data?.message ??
                      executeToolCodeQuery.error?.message
                    }
                    handleRunCode={handleRunCode}
                    isExecutionToolCodeError={executeToolCodeQuery.isError}
                    isExecutionToolCodePending={executeToolCodeQuery.isPending}
                    isExecutionToolCodeSuccess={executeToolCodeQuery.isSuccess}
                    mountTimestampRef={mountTimestamp}
                    regenerateToolMetadata={regenerateToolMetadata}
                    toolResultFiles={toolResultFiles}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        }
      />
    </Form>
  );
}

export default PlaygroundToolEditor;
