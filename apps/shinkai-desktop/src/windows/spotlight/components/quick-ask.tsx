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
import { Models } from '@shinkai_network/shinkai-node-state/lib/utils/models';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob';
import { useGetChatConfig } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConfig/useGetChatConfig';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/useGetChatConversationWithPagination';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  CopyToClipboardIcon,
  DotsLoader,
  MarkdownPreview,
  ScrollArea,
  Separator,
} from '@shinkai_network/shinkai-ui';
import { ShinkaiCombinationMarkIcon } from '@shinkai_network/shinkai-ui/assets';
import { copyToClipboard } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';

import { AIModelSelector } from '../../../components/chat/chat-action-bar/ai-update-selection-action-bar';
import { streamingSupportedModels } from '../../../components/chat/constants';
import { useWebSocketMessage } from '../../../components/chat/message-stream';
import { useDefaultAgentByDefault } from '../../../routes';
import { useAuth } from '../../../store/auth';
import { useSettings } from '../../../store/settings';
import { useQuickAskStore } from '../context/quick-ask';

export const hideSpotlightWindow = async () => {
  return invoke('hide_spotlight_window_app');
};

function QuickAsk() {
  const auth = useAuth((state) => state.auth);
  const defaultAgentId = useSettings((state) => state.defaultAgentId);
  const inboxId = useQuickAskStore((state) => state.inboxId);
  const setInboxId = useQuickAskStore((state) => state.setInboxId);
  const messageResponse = useQuickAskStore((state) => state.messageResponse);
  const setMessageResponse = useQuickAskStore(
    (state) => state.setMessageResponse,
  );
  const isLoadingResponse = useQuickAskStore(
    (state) => state.isLoadingResponse,
  );

  useDefaultAgentByDefault();

  const [clipboard, setClipboard] = useState(false);
  let timeout: ReturnType<typeof setTimeout>;

  useHotkeys(
    ['esc'],
    () => {
      hideSpotlightWindow();
    },
    {
      enableOnContentEditable: true,
      preventDefault: true,
      enableOnFormTags: true,
    },
  );

  useHotkeys(
    ['mod+c', 'ctrl+c'],
    () => {
      if (!messageResponse) return;
      const string_ = messageResponse.trim();
      copyToClipboard(string_);
      setClipboard(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setClipboard(false), 1000);
    },
    {
      enableOnContentEditable: true,
      preventDefault: true,
      enableOnFormTags: true,
    },
  );

  const chatForm = useForm<CreateJobFormSchema>({
    resolver: zodResolver(createJobFormSchema),
    defaultValues: {
      message: '',
      files: [],
    },
  });

  useEffect(() => {
    const unlisten = listen('tauri://focus', () => {
      chatForm.setFocus('message');
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const messageInput = chatForm.watch('message');

  useEffect(() => {
    chatForm.reset({
      message: '',
      agent: defaultAgentId,
      files: [],
    });
    setInboxId(null);
    setMessageResponse('');
  }, []);

  const { mutateAsync: createJob } = useCreateJob({
    onSuccess: (data) => {
      setInboxId(encodeURIComponent(buildInboxIdFromJobId(data.jobId)));
      chatForm.reset({
        message: '',
        agent: defaultAgentId,
        files: [],
      });
    },
  });

  useEffect(() => {
    chatForm.setValue('agent', defaultAgentId);
  }, [chatForm, defaultAgentId]);

  const onSubmit = async (data: CreateJobFormSchema) => {
    if (!auth) return;
    await createJob({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      llmProvider: data.agent,
      content: data.message,
      isHidden: false,
    });
  };

  return (
    <div className="relative flex size-full flex-col">
      {/*// TODO: drag support*/}
      {/*<div*/}
      {/*  className="absolute top-0 z-50 h-8 w-full"*/}
      {/*  data-tauri-drag-region={true}*/}
      {/*/>*/}
      <div className="font-lg flex h-[60px] shrink-0 items-center space-x-3 px-5 py-2">
        {inboxId && (
          <button
            className="h-6 w-6 rounded-md bg-gray-200 p-1"
            onClick={() => {
              setInboxId(null);
            }}
            type="button"
          >
            <ChevronLeft className="size-full" />
          </button>
        )}
        <input
          autoFocus
          className="placeholder:text-gray-80/70 flex-grow bg-transparent text-lg text-white focus:outline-none"
          {...chatForm.register('message')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              chatForm.handleSubmit(onSubmit)();
            }

            if (e.key === 'Backspace' && !chatForm.watch('message')) {
              setInboxId(null);
              setMessageResponse('');
            }
          }}
          placeholder="Ask a question..."
          spellCheck={false}
        />
        <AIModelSelector
          onValueChange={(value) => {
            chatForm.setValue('agent', value);
          }}
          value={chatForm.watch('agent')}
        />
      </div>
      <Separator className="bg-gray-350" />
      <QuickAskBody aiModel={chatForm.watch('agent')} />

      <Separator className="bg-gray-350" />
      <div className="flex h-10 w-full items-center justify-between px-4 py-1.5 text-xs">
        <div>
          {isLoadingResponse ? (
            <div className="flex items-center justify-center gap-2 rounded-md px-1.5 py-0.5 text-center text-gray-100 transition-colors hover:bg-gray-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Getting AI response...</span>
            </div>
          ) : (
            // TODO: Support for full longer text
            // <button
            //   className="text-gray-80 flex items-center justify-center gap-2 rounded-md px-1.5 py-0.5 text-center transition-colors hover:bg-gray-300"
            //   disabled
            // >
            //   <span>Full Text Input </span>
            //   <span className="flex items-center gap-1">
            //     <kbd className="text-gray-1100 flex h-5 w-5 items-center justify-center rounded-md bg-gray-300 px-1 font-sans">
            //       ⌘
            //     </kbd>
            //     <kbd className="text-gray-1100 flex h-5 w-5 items-center justify-center rounded-md bg-gray-300 px-1 font-sans">
            //       N
            //     </kbd>
            //   </span>
            // </button>
            <ShinkaiCombinationMarkIcon className="h-auto w-[60px] text-gray-100" />
          )}
        </div>
        <div className="flex items-center gap-1">
          {messageInput ? (
            <button
              className="text-gray-80 flex items-center justify-center gap-2 rounded-md px-1.5 py-0.5 text-center transition-colors hover:bg-gray-300"
              onClick={chatForm.handleSubmit(onSubmit)}
            >
              <span>Submit</span>
              <kbd className="text-gray-1100 flex h-5 w-5 items-center justify-center rounded-md bg-gray-300 px-1 font-sans">
                ↵
              </kbd>
            </button>
          ) : messageResponse ? (
            <CopyToClipboardIcon asChild string={messageResponse}>
              <button className="text-gray-80 flex items-center justify-center gap-2 rounded-md px-1.5 py-0.5 text-center transition-colors hover:bg-gray-300">
                {clipboard && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                )}
                <span>{clipboard ? 'Copied' : 'Copy'} Answer</span>
                <span className="flex items-center gap-1">
                  <kbd className="text-gray-1100 flex h-5 w-5 items-center justify-center rounded-md bg-gray-300 px-1 font-sans">
                    ⌘
                  </kbd>
                  <kbd className="text-gray-1100 flex h-5 w-5 items-center justify-center rounded-md bg-gray-300 px-1 font-sans">
                    C
                  </kbd>
                </span>
              </button>
            </CopyToClipboardIcon>
          ) : (
            // should toggle longer text mode
            <button
              className="text-gray-80 flex items-center justify-center gap-2 rounded-md px-1.5 py-0.5 text-center transition-colors hover:bg-gray-300"
              onClick={chatForm.handleSubmit(onSubmit)}
            >
              <span>Submit</span>
              <kbd className="text-gray-1100 flex h-5 w-5 items-center justify-center rounded-md bg-gray-300 px-1 font-sans">
                ↵
              </kbd>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuickAsk;

const QuickAskBody = ({ aiModel }: { aiModel: string }) => {
  const { t } = useTranslation();
  const inboxId = useQuickAskStore((state) => state.inboxId);

  const decodedInboxId = decodeURIComponent(inboxId ?? '');
  if (!decodedInboxId) {
    return (
      <div className="flex h-full w-full flex-1 items-center justify-center p-6">
        <motion.div
          animate={{ opacity: 1 }}
          className="flex max-w-lg flex-col items-center gap-2 text-center"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span aria-hidden={true} className="text-4xl">
            🤖
          </span>

          <h1 className="text-xl font-bold text-white">
            {t('quickAsk.emptyStateTitle')}
          </h1>
          <p className="text-gray-80 text-xs">
            {t('quickAsk.emptyStateDescription')}
          </p>
        </motion.div>
      </div>
    );
  }
  return (
    <QuickAskBodyWithResponse aiModel={aiModel} inboxId={decodedInboxId} />
  );
};

const QuickAskBodyWithResponse = ({
  inboxId,
  aiModel,
}: {
  inboxId: string;
  aiModel: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const auth = useAuth((state) => state.auth);
  const setLoadingResponse = useQuickAskStore(
    (state) => state.setLoadingResponse,
  );
  const { llmProviders } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const currentModel = llmProviders?.find(
    (provider) => provider.id === aiModel,
  );

  const hasProviderEnableStreaming = streamingSupportedModels.includes(
    currentModel?.model.split(':')?.[0] as Models,
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
  const inputMessage = data?.pages?.at(-1)?.at(0);

  const isLoadingMessage = useMemo(() => {
    return lastMessage?.isLocal;
  }, [lastMessage?.isLocal]);

  const { messageContent } = useWebSocketMessage({
    enabled: hasProviderEnableStreaming,
    inboxId: inboxId,
  });
  const setMessageResponse = useQuickAskStore(
    (state) => state.setMessageResponse,
  );

  useEffect(() => {
    setLoadingResponse(!!isLoadingMessage);
  }, [isLoadingMessage]);

  useEffect(() => {
    if (!isLoadingMessage && lastMessage?.content) {
      setMessageResponse(lastMessage?.content);
    }
  }, [isLoadingMessage, lastMessage?.content, setMessageResponse]);

  useLayoutEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current?.scrollHeight,
      behavior: 'smooth',
    });
  }, [messageContent]);

  return (
    <ScrollArea
      className="flex-1 text-sm [&>div>div]:!block"
      ref={containerRef}
    >
      <Collapsible className="border-b border-gray-200 bg-gray-400">
        <CollapsibleTrigger
          className={cn(
            'flex w-full max-w-full items-center justify-between gap-6 px-5 py-2',
            '[&[data-state=open]>svg]:rotate-90',
            '[&[data-state=open]>span.input]:block',
            '[&[data-state=open]>span.content]:hidden',
          )}
        >
          <span className="input text-gray-80 hidden flex-1 items-center gap-1 truncate text-left text-xs">
            Input Message
          </span>
          <span className="content flex-1 truncate text-left text-gray-50">
            {inputMessage?.content}
          </span>

          <ChevronRight className="text-gray-80 h-4 w-4 shrink-0" />
        </CollapsibleTrigger>
        <CollapsibleContent className="max-h-[150px] overflow-y-auto px-5 pb-2 pt-0.5">
          <MarkdownPreview
            className="prose-h1:!text-gray-50 prose-h1:!text-sm !text-sm !text-gray-50"
            source={inputMessage?.content}
          />
        </CollapsibleContent>
      </Collapsible>
      <div className="p-5 pb-4">
        {isLoadingMessage && (
          <>
            {messageContent === '' && <DotsLoader className="pl-1 pt-1" />}
            <MarkdownPreview
              className="prose-h1:!text-white prose-h1:!text-sm !text-sm !text-white"
              source={messageContent}
            />
          </>
        )}
        {!isLoadingMessage && (
          <MarkdownPreview
            className="prose-h1:!text-white prose-h1:!text-sm !text-sm !text-white"
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
    </ScrollArea>
  );
};
