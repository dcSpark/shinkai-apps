import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils';
import { Models } from '@shinkai_network/shinkai-node-state/lib/utils/models';
import { useGetChatConfig } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConfig/useGetChatConfig';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/useGetChatConversationWithPagination';
import {
  CopyToClipboardIcon,
  DotsLoader,
  MarkdownPreview,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { useMemo } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { z } from 'zod';

import { streamingSupportedModels } from '../components/chat/constants';
import { useWebSocketMessage } from '../components/chat/message-stream';
import BamlEditor from '../components/playground/baml-editor';
import DocsPanel from '../components/playground/docs-panel';
import WorkflowEditor from '../components/playground/workflow-editor';
import { useGetCurrentInbox } from '../hooks/use-current-inbox';
import { useAuth } from '../store/auth';

export const createWorkflowFormSchema = z.object({
  workflowRaw: z.string().min(1, 'Workflow code is required'),
  workflowDescription: z.string().min(1, 'Workflow description is required'),
});

export type CreateWorkflowFormSchema = z.infer<typeof createWorkflowFormSchema>;

const WorkflowPlayground = () => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tabs className="h-full min-h-screen" defaultValue="workflow">
        <div className="mx-auto flex h-full flex-col">
          <div className="flex justify-between gap-4 border-b border-gray-300 px-5 pt-6">
            <div className="flex items-center gap-8 pb-5">
              <h1 className="text-2xl font-semibold tracking-tight">
                Playground
              </h1>
              <TabsList className="grid w-full grid-cols-2 rounded-lg border border-gray-400 bg-transparent p-0.5">
                <TabsTrigger
                  className="flex h-8 items-center gap-1.5 text-xs font-semibold"
                  value="workflow"
                >
                  Workflow
                </TabsTrigger>
                <TabsTrigger
                  className="flex h-8 items-center gap-1.5 text-xs font-semibold"
                  value="baml"
                >
                  BAML
                </TabsTrigger>
              </TabsList>
            </div>
            <div>
              <DocsPanel />
            </div>
          </div>
          <div className="flex max-h-[calc(100vh-87px)] flex-1 overflow-hidden">
            <div className="max-w-[60%] flex-1 shrink-0 basis-[60%] border-r border-gray-300">
              <TabsContent className="mt-0 h-full" value="workflow">
                <WorkflowEditor />
              </TabsContent>
              <TabsContent className="mt-0 h-full" value="baml">
                <BamlEditor />
              </TabsContent>
            </div>
            <div className="h-full flex-1 flex-col">
              <Outlet />
            </div>
          </div>
        </div>
      </Tabs>
    </TooltipProvider>
  );
};
export default WorkflowPlayground;

function PlaygroundPreviewWithInbox({ inboxId }: { inboxId: string }) {
  const { t } = useTranslation();

  const auth = useAuth((state) => state.auth);
  const currentInbox = useGetCurrentInbox();

  const hasProviderEnableStreaming = streamingSupportedModels.includes(
    currentInbox?.agent?.model.split(':')?.[0] as Models,
  );

  const { data: chatConfig } = useGetChatConfig({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    jobId: extractJobIdFromInbox(inboxId),
  });

  const { data } = useGetChatConversationWithPagination({
    token: auth?.api_v2_key ?? '',
    nodeAddress: auth?.node_address ?? '',
    inboxId: inboxId as string,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    refetchIntervalEnabled:
      !hasProviderEnableStreaming || chatConfig?.stream === false,
  });

  const lastMessage = data?.pages?.at(-1)?.at(-1);

  const isLoadingMessage = useMemo(() => {
    return lastMessage?.isLocal;
  }, [lastMessage?.isLocal]);

  const { messageContent } = useWebSocketMessage({
    enabled: hasProviderEnableStreaming,
  });

  return (
    <div className="h-full space-y-6 overflow-y-auto px-4 pb-4">
      <div className="flex items-center justify-between gap-3 pt-5">
        <span className="text-sm font-semibold text-gray-50">Output</span>
        {lastMessage?.content && (
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <CopyToClipboardIcon
                    className={cn(
                      'text-gray-80 bg-gray-450 h-7 w-7 border border-gray-200 hover:bg-gray-300 [&>svg]:h-3 [&>svg]:w-3',
                    )}
                    string={lastMessage?.content}
                  />
                </div>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent>
                  <p>{t('common.copy')}</p>
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </div>
        )}
      </div>
      <div className="pb-4">
        {isLoadingMessage && (
          <>
            {messageContent === '' && <DotsLoader className="pl-1 pt-1" />}
            <MarkdownPreview
              className="prose-h1:!text-gray-80 prose-h1:!text-sm !text-gray-80 !text-sm"
              source={messageContent}
            />
          </>
        )}
        {!isLoadingMessage && (
          <MarkdownPreview
            className="prose-h1:!text-gray-80 prose-h1:!text-sm !text-gray-80 !text-sm"
            source={
              lastMessage?.content?.startsWith('{') &&
              lastMessage?.content?.endsWith('}')
                ? `
\`\`\`json
${lastMessage?.content}
\`\`\`
`
                : lastMessage?.content
            }
          />
        )}
      </div>
    </div>
  );
}

function PlaygroundPreviewEmpty() {
  return (
    <div className="h-full space-y-6 overflow-y-auto px-4 pb-4">
      <div className="flex items-center justify-between gap-3 pt-5">
        <span className="text-sm font-semibold text-gray-50">Output</span>
      </div>
      <div className="">
        <p className="text-gray-80 text-sm">
          Run a workflow/baml to see the output here.
        </p>
      </div>
    </div>
  );
}
export function PlaygroundPreview() {
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);

  if (inboxId) {
    return <PlaygroundPreviewWithInbox inboxId={inboxId} />;
  }

  return <PlaygroundPreviewEmpty />;
}

export function useStopGenerationPlayground() {
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);
  const auth = useAuth((state) => state.auth);

  const currentInbox = useGetCurrentInbox();
  const { data: chatConfig } = useGetChatConfig(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      jobId: inboxId ? extractJobIdFromInbox(inboxId) : '',
    },
    {
      enabled: !!inboxId,
    },
  );

  const hasProviderEnableStreaming = streamingSupportedModels.includes(
    currentInbox?.agent?.model.split(':')?.[0] as Models,
  );

  const { data } = useGetChatConversationWithPagination({
    token: auth?.api_v2_key ?? '',
    nodeAddress: auth?.node_address ?? '',
    inboxId: inboxId as string,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    refetchIntervalEnabled:
      !hasProviderEnableStreaming || chatConfig?.stream === false,
    enabled: !!inboxId,
  });

  const isLoadingMessage = useMemo(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    return !!inboxId && lastMessage?.isLocal;
  }, [data?.pages, inboxId]);

  return {
    isLoadingMessage,
  };
}
