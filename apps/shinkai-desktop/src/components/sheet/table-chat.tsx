import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  buildInboxIdFromJobId,
  extractJobIdFromInbox,
} from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import {
  CreateJobFormSchema,
  createJobFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/create-job';
import {
  DEFAULT_CHAT_CONFIG,
  FunctionKeyV2,
} from '@shinkai_network/shinkai-node-state/v2/constants';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/v2/mutations/sendMessageToJob/useSendMessageToJob';
import {
  Button,
  Form,
  FormField,
  Input,
  MessageList,
} from '@shinkai_network/shinkai-ui';
import { SendIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { useChatConversationWithOptimisticUpdates } from '../../pages/chat/chat-conversation';
import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';
import {
  AIModelSelector,
  AiUpdateSelectionActionBar,
} from '../chat/chat-action-bar/ai-update-selection-action-bar';
import { useWebSocketMessage } from '../chat/websocket-message';
import { useSheetProjectStore } from './context/table-context';

export default function ChatTable() {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();
  const defaultAgentId = useSettings(
    (settingsStore) => settingsStore.defaultAgentId,
  );

  const [chatInboxId, setChatInboxId] = useState<string | null>(null);

  useWebSocketMessage({
    inboxId: chatInboxId ?? '',
    enabled: true,
  });

  const { sheetId } = useParams();
  const toggleChatPanel = useSheetProjectStore(
    (state) => state.toggleChatPanel,
  );
  const createJobForm = useForm<CreateJobFormSchema>({
    resolver: zodResolver(createJobFormSchema),
    defaultValues: {
      agent: '',
      message: '',
      files: [],
    },
  });

  useEffect(() => {
    createJobForm.setValue('agent', defaultAgentId);
  }, [createJobForm, defaultAgentId]);

  const { mutateAsync: createJob } = useCreateJob({
    onSuccess: (data) => {
      setChatInboxId(buildInboxIdFromJobId(data.jobId));
    },
  });
  const { mutateAsync: sendMessageToJob } = useSendMessageToJob({});
  const queryClient = useQueryClient();

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
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    if (!chatInboxId || !lastMessage) return;
    queryClient.invalidateQueries({
      queryKey: [FunctionKeyV2.GET_SHEET],
    });
  }, [chatInboxId, data?.pages, queryClient]);

  const isLoadingMessage = useMemo(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    return (
      !!chatInboxId &&
      lastMessage?.role === 'assistant' &&
      lastMessage?.status.type === 'running'
    );
  }, [data?.pages, chatInboxId]);

  const onSubmit = async (data: CreateJobFormSchema) => {
    if (!sheetId || !auth) return;

    if (!chatInboxId) {
      await createJob({
        nodeAddress: auth.node_address,
        token: auth.api_v2_key,
        llmProvider: data.agent,
        sheetId,
        content: data.message,
        isHidden: true,
        chatConfig: {
          stream: DEFAULT_CHAT_CONFIG.stream,
          custom_prompt: '',
          temperature: DEFAULT_CHAT_CONFIG.temperature,
          top_p: DEFAULT_CHAT_CONFIG.top_p,
          top_k: DEFAULT_CHAT_CONFIG.top_k,
        },
      });
      createJobForm.reset();
      return;
    }
    if (!chatInboxId) return;
    await sendMessageToJob({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      jobId: extractJobIdFromInbox(chatInboxId),
      message: data.message,
      parent: '',
    });
    createJobForm.reset();
  };

  return (
    <div className="flex h-full max-h-screen flex-col gap-2 p-5 px-4 py-8">
      <Button
        className="absolute right-4 top-4"
        onClick={toggleChatPanel}
        size="icon"
        variant="tertiary"
      >
        <XIcon className="text-gray-80 h-5 w-5" />
      </Button>
      <h1 className="text-base">Ask Shinkai AI</h1>
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
              Chat with your Shinkai Sheet
            </h2>
            <p className="text-gray-80 text-xs">
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              "Generate a new column with top 10 tech startups", “Create
              {/* eslint-disable-next-line react/no-unescaped-entities */}a new
              colum", “Add a new row”
            </p>
          </>
        )}
        {chatInboxId && (
          <MessageList
            containerClassName="px-5"
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

      <Form {...createJobForm}>
        <form
          className="space-y-2"
          onSubmit={createJobForm.handleSubmit(onSubmit)}
        >
          {chatInboxId ? (
            <AiUpdateSelectionActionBar inboxId={chatInboxId} />
          ) : (
            <AIModelSelector
              onValueChange={(value) => {
                createJobForm.setValue('agent', value);
              }}
              value={createJobForm.watch('agent')}
            />
          )}
          <div className="flex shrink-0 items-center gap-1">
            <FormField
              control={createJobForm.control}
              name="message"
              render={({ field }) => (
                <Input
                  autoFocus
                  className="placeholder-gray-80 !h-[50px] flex-1 bg-gray-200 px-3 py-2"
                  disabled={isLoadingMessage}
                  onChange={field.onChange}
                  placeholder={'Ask Shinkai AI'}
                  value={field.value}
                />
              )}
            />

            <Button
              className="aspect-square h-[90%] shrink-0 rounded-lg p-2"
              disabled={isLoadingMessage}
              size="auto"
              type="submit"
              variant="default"
            >
              <SendIcon className="h-4.5 w-4.5" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
