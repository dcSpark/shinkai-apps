import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { buildInboxIdFromJobId,extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { Button, Form, FormField, Input } from '@shinkai_network/shinkai-ui';
import { SendIcon } from '@shinkai_network/shinkai-ui/assets';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2,X } from 'lucide-react';
import { useEffect,useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useChatConversationWithOptimisticUpdates } from '../../pages/chat/chat-conversation';
import { useAuth } from '../../store/auth';
import { AiUpdateSelectionActionBar } from '../chat/chat-action-bar/ai-update-selection-action-bar';
import { MessageList } from '../chat/components/message-list';
import { ChatProvider } from '../chat/context/chat-context';
import { useWebSocketMessage } from '../chat/websocket-message';

interface AgentSideChatProps {
  agentId: string;
  onClose: () => void;
}

export function AgentSideChat({ agentId, onClose }: AgentSideChatProps) {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const queryClient = useQueryClient();
  const [chatInboxId, setChatInboxId] = useState<string | null>(null);
  const [hasTools, setHasTools] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useWebSocketMessage({
    inboxId: chatInboxId ?? '',
    enabled: !!chatInboxId,
  });

  const chatForm = useForm({
    defaultValues: {
      message: '',
    },
  });

  const {
    data,
    fetchPreviousPage,
    hasPreviousPage,
    isChatConversationLoading,
    isFetchingPreviousPage,
    isChatConversationSuccess,
  } = useChatConversationWithOptimisticUpdates({
    inboxId: chatInboxId ?? '',
    forceRefetchInterval: true,
  });

  useEffect(() => {
    const checkAgentTools = async () => {
      try {
        const { useGetAgent } = await import('@shinkai_network/shinkai-node-state/v2/queries/getAgent/useGetAgent');
        
        const getAgentHook = useGetAgent({
          agentId,
          nodeAddress: auth?.node_address ?? '',
          token: auth?.api_v2_key ?? '',
        });
        
        const agentData = await getAgentHook.refetch();
        const tools = agentData.data?.tools || [];
        setHasTools(tools.length > 0);
      } catch (error) {
        console.error('Error checking agent tools:', error);
      }
    };
    
    if (agentId) {
      checkAgentTools();
    }
  }, [agentId, auth]);

  const isLoadingMessage = !!chatInboxId && data?.pages?.at(-1)?.at(-1)?.role === 'assistant' && (data?.pages?.at(-1)?.at(-1) as any)?.status?.type === 'running';

  const createInitialJob = async (message: string) => {
    try {
      setIsLoading(true);
      
      const { useCreateJob } = await import('@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob');
      const { DEFAULT_CHAT_CONFIG } = await import('@shinkai_network/shinkai-node-state/v2/constants');
      const createJobHook = useCreateJob({});
      
      const result = await createJobHook.mutateAsync({
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        llmProvider: agentId,
        content: message,
        chatConfig: {
          ...DEFAULT_CHAT_CONFIG,
          use_tools: hasTools,
          function_calling: hasTools ? 'auto' : 'none',
        },
      } as any);
      
      setChatInboxId(buildInboxIdFromJobId(result.jobId));
      setIsLoading(false);
      chatForm.reset();
    } catch (error: any) {
      toast.error('Failed to start chat', {
        description: error?.message || 'An error occurred',
      });
      setIsLoading(false);
    }
  };

  const sendMessageToExistingJob = async (message: string) => {
    if (!chatInboxId) return;
    
    try {
      setIsLoading(true);
      
      const { useSendMessageToJob } = await import('@shinkai_network/shinkai-node-state/v2/mutations/sendMessageToJob/useSendMessageToJob');
      const { FunctionKeyV2 } = await import('@shinkai_network/shinkai-node-state/v2/constants');
      const sendMessageHook = useSendMessageToJob({});
      
      await sendMessageHook.mutateAsync({
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        jobId: extractJobIdFromInbox(chatInboxId),
        message,
        parent: '',
      });
      
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_CHAT_CONVERSATION_PAGINATION, { inboxId: chatInboxId }],
      });
      
      setIsLoading(false);
      chatForm.reset();
    } catch (error: any) {
      toast.error('Failed to send message', {
        description: error?.message || 'An error occurred',
      });
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: { message: string }) => {
    if (!auth || !agentId) return;
    
    if (!chatInboxId) {
      await createInitialJob(data.message);
    } else {
      await sendMessageToExistingJob(data.message);
    }
  };

  return (
    <ChatProvider>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-medium">Chat with Agent</h2>
          <Button onClick={onClose} size="sm" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {!chatInboxId ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <span aria-hidden className="text-3xl">🤖</span>
              <h2 className="text-base font-medium">
                Start chatting with your agent
              </h2>
              <p className="text-official-gray-400 text-sm">
                Send a message to start testing your agent
              </p>
            </div>
          ) : (
            <MessageList
              disabledRetryAndEdit={true}
              fetchPreviousPage={fetchPreviousPage}
              hasPreviousPage={hasPreviousPage}
              isFetchingPreviousPage={isFetchingPreviousPage}
              isLoading={isChatConversationLoading}
              isSuccess={isChatConversationSuccess}
              noMoreMessageLabel={t('chat.allMessagesLoaded')}
              paginatedMessages={data}
            />
          )}
        </div>
        
        <div className="border-t p-4">
          <Form {...chatForm}>
            <form
              className="space-y-2"
              onSubmit={chatForm.handleSubmit(onSubmit)}
            >
              {chatInboxId && (
                <AiUpdateSelectionActionBar inboxId={chatInboxId} />
              )}
              <div className="flex shrink-0 items-center gap-1">
                <FormField
                  control={chatForm.control}
                  name="message"
                  render={({ field }) => (
                    <Input
                      className="placeholder-gray-80 !h-[50px] flex-1 bg-gray-200 px-3 py-2"
                      disabled={isLoading || isLoadingMessage}
                      onChange={field.onChange}
                      placeholder={'Message your agent...'}
                      value={field.value}
                    />
                  )}
                />

                <Button
                  className="aspect-square h-[90%] shrink-0 rounded-lg p-2"
                  disabled={isLoading || isLoadingMessage}
                  size="auto"
                  type="submit"
                  variant="default"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SendIcon className="h-4.5 w-4.5" />
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </ChatProvider>
  );
}
