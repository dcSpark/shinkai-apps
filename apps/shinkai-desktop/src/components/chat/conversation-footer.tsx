import { zodResolver } from '@hookform/resolvers/zod';
import { StopIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  extractJobIdFromInbox,
  extractReceiverShinkaiName,
  isJobInbox,
} from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import {
  ChatMessageFormSchema,
  chatMessageFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/chat-message';
import { useSendMessageToInbox } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMesssageToInbox/useSendMessageToInbox';
import { Models } from '@shinkai_network/shinkai-node-state/lib/utils/models';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/v2/mutations/sendMessageToJob/useSendMessageToJob';
import { useStopGeneratingLLM } from '@shinkai_network/shinkai-node-state/v2/mutations/stopGeneratingLLM/useStopGeneratingLLM';
import { useGetChatConfig } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConfig/useGetChatConfig';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/useGetChatConversationWithPagination';
import { useGetWorkflowSearch } from '@shinkai_network/shinkai-node-state/v2/queries/getWorkflowSearch/useGetWorkflowSearch';
import {
  Button,
  ChatInputArea,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  fileIconMap,
  FileTypeIcon,
  WorkflowPlaygroundIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { getFileExt } from '@shinkai_network/shinkai-ui/helpers';
import { useDebounce } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { partial } from 'filesize';
import { AnimatePresence, motion } from 'framer-motion';
import { Paperclip, SendIcon, X, XIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { useGetCurrentInbox } from '../../hooks/use-current-inbox';
import { useAnalytics } from '../../lib/posthog-provider';
import { formatText } from '../../pages/create-job';
import { useAuth } from '../../store/auth';
import { useWorkflowSelectionStore } from '../workflow/context/workflow-selection-context';
import AiSelectionActionBar from './chat-action-bar/ai-selection-action-bar';
import ChatConfigActionBar from './chat-action-bar/chat-config-action-bar';
import WorkflowSelectionActionBar from './chat-action-bar/workflow-selection-action-bar';
import { streamingSupportedModels } from './constants';

export default function ConversationFooter() {
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);
  const { t } = useTranslation();
  const size = partial({ standard: 'jedec' });

  const auth = useAuth((state) => state.auth);
  const { captureAnalyticEvent } = useAnalytics();

  const fromPreviousMessagesRef = useRef<boolean>(false);
  const chatForm = useForm<ChatMessageFormSchema>({
    resolver: zodResolver(chatMessageFormSchema),
    defaultValues: {
      message: '',
      files: [],
    },
  });
  const currentInbox = useGetCurrentInbox();
  const { data: chatConfig } = useGetChatConfig({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    jobId: extractJobIdFromInbox(inboxId),
  });

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
  });

  const [firstMessageWorkflow, setFirstMessageWorkflow] = useState<{
    name: string;
    author: string;
    tool_router_key: string;
  } | null>(null);

  useEffect(() => {
    if (data?.pages && data.pages.length > 0 && data.pages[0].length > 0) {
      const firstMessage = data.pages[0][0];
      if (firstMessage.workflowName) {
        const [name, author] = firstMessage.workflowName.split(':::');
        setFirstMessageWorkflow({
          name,
          author,
          tool_router_key: firstMessage.workflowName,
        });
      }
    }
  }, [data?.pages]);

  const workflowSelected = useWorkflowSelectionStore(
    (state) => state.workflowSelected,
  );
  const setWorkflowSelected = useWorkflowSelectionStore(
    (state) => state.setWorkflowSelected,
  );

  const currentMessage = useWatch({
    control: chatForm.control,
    name: 'message',
  });
  const debounceMessage = useDebounce(currentMessage, 500);

  const {
    data: workflowRecommendations,
    isSuccess: isWorkflowRecommendationsSuccess,
  } = useGetWorkflowSearch(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      search: debounceMessage,
    },
    {
      enabled: !!debounceMessage && !!currentMessage,
      select: (data) => data.slice(0, 3),
    },
  );

  const { mutateAsync: stopGenerating } = useStopGeneratingLLM();

  const { getRootProps: getRootFileProps, getInputProps: getInputFileProps } =
    useDropzone({
      multiple: true,
      onDrop: (acceptedFiles) => {
        chatForm.setValue('files', acceptedFiles, { shouldValidate: true });
      },
    });

  const currentFiles = useWatch({
    control: chatForm.control,
    name: 'files',
  });

  const { mutateAsync: sendMessageToInbox } = useSendMessageToInbox();
  const { mutateAsync: sendMessageToJob } = useSendMessageToJob({
    onSuccess: (_, variables) => {
      if (variables.files && variables.files.length > 0) {
        captureAnalyticEvent('AI Chat with Files', {
          filesCount: variables.files.length,
        });
      } else {
        captureAnalyticEvent('AI Chat', undefined);
      }
    },
  });

  const isLoadingMessage = useMemo(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    return isJobInbox(inboxId) && lastMessage?.isLocal;
  }, [data?.pages, inboxId]);

  const isWorkflowSelectedAndFilesPresent =
    workflowSelected && currentFiles && currentFiles.length > 0;

  useEffect(() => {
    if (isWorkflowSelectedAndFilesPresent) {
      chatForm.setValue(
        'message',
        `${formatText(workflowSelected.name)} - ${workflowSelected.description}`,
      );
    }
  }, [chatForm, isWorkflowSelectedAndFilesPresent, workflowSelected]);

  const onSubmit = async (data: ChatMessageFormSchema) => {
    if (!auth || data.message.trim() === '') return;
    fromPreviousMessagesRef.current = false;

    let workflowKeyToUse = workflowSelected?.tool_router_key;
    if (!workflowKeyToUse && firstMessageWorkflow) {
      workflowKeyToUse = firstMessageWorkflow.tool_router_key;
    }

    // if (currentFiles && currentFiles.length > 0) {
    //   await sendTextMessageWithFilesForInbox({
    //     nodeAddress: auth?.node_address ?? '',
    //     sender: auth.shinkai_identity,
    //     senderSubidentity: auth.profile,
    //     receiver: auth.shinkai_identity,
    //     message: data.message,
    //     inboxId: inboxId,
    //     files: currentFiles,
    //     workflowName: workflowKeyToUse,
    //     my_device_encryption_sk: auth.my_device_encryption_sk,
    //     my_device_identity_sk: auth.my_device_identity_sk,
    //     node_encryption_pk: auth.node_encryption_pk,
    //     profile_encryption_sk: auth.profile_encryption_sk,
    //     profile_identity_sk: auth.profile_identity_sk,
    //   });
    //   chatForm.reset();
    //   return;
    // }

    if (isJobInbox(inboxId)) {
      const jobId = extractJobIdFromInbox(inboxId);
      console.log({
        token: auth.api_v2_key,
        nodeAddress: auth.node_address,
        jobId: jobId,
        message: data.message,
        parent: '', // Note: we should set the parent if we want to retry or branch out
        workflowName: workflowKeyToUse,
        files: currentFiles,
      });
      await sendMessageToJob({
        token: auth.api_v2_key,
        nodeAddress: auth.node_address,
        jobId: jobId,
        message: data.message,
        parent: '', // Note: we should set the parent if we want to retry or branch out
        workflowName: workflowKeyToUse,
        files: currentFiles,
      });
    } else {
      const sender = `${auth.shinkai_identity}/${auth.profile}/device/${auth.registration_name}`;
      const receiver = extractReceiverShinkaiName(inboxId, sender);
      await sendMessageToInbox({
        nodeAddress: auth?.node_address ?? '',
        sender: auth.shinkai_identity,
        sender_subidentity: `${auth.profile}/device/${auth.registration_name}`,
        receiver,
        message: data.message,
        inboxId: inboxId,
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
      });
    }
    chatForm.reset();
    setWorkflowSelected(undefined);
  };

  useEffect(() => {
    chatForm.reset();
    setWorkflowSelected(undefined);
  }, [chatForm, inboxId]);

  return (
    <div className="flex flex-col justify-start">
      <div className="relative flex items-start gap-2 p-2 pb-3">
        <AnimatePresence>
          {hasProviderEnableStreaming && isLoadingMessage && (
            <motion.button
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-350 absolute -top-6 left-[calc(50%-40px)] flex items-center justify-center gap-3 rounded-lg border px-2 py-1.5 text-xs text-white transition-colors hover:bg-gray-300"
              exit={{ opacity: 0, y: 10 }}
              initial={{ opacity: 0, y: 10 }}
              onClick={() => {
                const decodedInboxId = decodeURIComponent(inboxId);
                const jobId = extractJobIdFromInbox(decodedInboxId);
                stopGenerating({
                  nodeAddress: auth?.node_address ?? '',
                  token: auth?.api_v2_key ?? '',
                  jobId: jobId,
                });
              }}
              transition={{ duration: 0.2 }}
            >
              <StopIcon className="h-4 w-4" />
              Stop generating
            </motion.button>
          )}
        </AnimatePresence>
        <Form {...chatForm}>
          <FormField
            control={chatForm.control}
            name="message"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-0">
                <FormLabel className="sr-only">
                  {t('chat.enterMessage')}
                </FormLabel>
                <FormControl>
                  <div className="">
                    <div className="flex items-center justify-between gap-4 px-1 pb-2 pt-1">
                      <div className="flex items-center gap-2.5">
                        <AiSelectionActionBar />
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                {...getRootFileProps({
                                  className: cn(
                                    'hover:bg-gray-350 relative flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg p-1.5 text-white',
                                  ),
                                })}
                              >
                                <Paperclip className="h-full w-full" />
                                <input
                                  {...chatForm.register('files')}
                                  {...getInputFileProps({
                                    onChange:
                                      chatForm.register('files').onChange,
                                  })}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipPortal>
                              <TooltipContent align="center" side="top">
                                {t('common.uploadFile')}
                              </TooltipContent>
                            </TooltipPortal>
                          </Tooltip>
                        </TooltipProvider>
                        <WorkflowSelectionActionBar />
                      </div>
                      <ChatConfigActionBar />
                    </div>

                    <ChatInputArea
                      autoFocus
                      bottomAddons={
                        <Button
                          className="hover:bg-app-gradient h-[40px] w-[40px] self-end rounded-xl bg-gray-500 p-3 disabled:cursor-not-allowed"
                          disabled={isLoadingMessage}
                          onClick={chatForm.handleSubmit(onSubmit)}
                          size="icon"
                          variant="tertiary"
                        >
                          <SendIcon className="h-full w-full" />
                          <span className="sr-only">
                            {t('chat.sendMessage')}
                          </span>
                        </Button>
                      }
                      disabled={
                        isLoadingMessage || isWorkflowSelectedAndFilesPresent
                      }
                      // isLoading={isLoadingMessage}
                      onChange={field.onChange}
                      onSubmit={chatForm.handleSubmit(onSubmit)}
                      topAddons={
                        <>
                          {workflowSelected && (
                            <div className="relative max-w-full rounded-lg border border-gray-200 p-1.5 px-2">
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2 pr-6">
                                      <WorkflowPlaygroundIcon className="h-3.5 w-3.5" />
                                      <div className="text-gray-80 line-clamp-1 text-xs">
                                        <span className="text-white">
                                          {formatText(workflowSelected.name)}{' '}
                                        </span>
                                        -{' '}
                                        <span className="">
                                          {workflowSelected.description}
                                        </span>
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipPortal>
                                    <TooltipContent
                                      align="end"
                                      alignOffset={-10}
                                      className="max-w-[400px]"
                                      side="top"
                                      sideOffset={10}
                                    >
                                      {workflowSelected.description}
                                    </TooltipContent>
                                  </TooltipPortal>
                                </Tooltip>
                              </TooltipProvider>
                              <button
                                className="absolute right-2 top-1.5 text-gray-100 hover:text-white"
                                onClick={() => {
                                  setWorkflowSelected(undefined);
                                }}
                                type="button"
                              >
                                <XIcon className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                          {currentFiles && currentFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {currentFiles.map((file, index) => (
                                <div
                                  className="relative mt-1 flex min-w-[180px] max-w-[220px] items-center gap-2 self-start rounded-lg border border-gray-200 px-2 py-2.5"
                                  key={index}
                                >
                                  {getFileExt(file.name) &&
                                  fileIconMap[getFileExt(file.name)] ? (
                                    <FileTypeIcon
                                      className="text-gray-80 h-7 w-7 shrink-0"
                                      type={getFileExt(file.name)}
                                    />
                                  ) : (
                                    <Paperclip className="text-gray-80 h-4 w-4 shrink-0" />
                                  )}
                                  <div className="space-y-1">
                                    <span className="line-clamp-1 break-all text-left text-xs">
                                      {file.name}
                                    </span>
                                    <span className="line-clamp-1 break-all text-left text-xs text-gray-100">
                                      {size(file.size)}
                                    </span>
                                  </div>
                                  <button
                                    className={cn(
                                      'absolute -right-2 -top-2 h-5 w-5 cursor-pointer rounded-full bg-gray-500 p-1 text-gray-100 hover:text-white',
                                    )}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      const newFiles = [...currentFiles];
                                      newFiles.splice(index, 1);
                                      chatForm.setValue('files', newFiles, {
                                        shouldValidate: true,
                                      });
                                    }}
                                  >
                                    <X className="h-full w-full" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      }
                      value={field.value}
                    />
                    <motion.div
                      animate={{ opacity: 1 }}
                      className="absolute inset-x-3 bottom-2 flex items-center justify-between gap-2"
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex gap-2">
                        {!!debounceMessage &&
                          !workflowSelected &&
                          isWorkflowRecommendationsSuccess &&
                          workflowRecommendations?.length > 0 &&
                          workflowRecommendations?.map((workflow) => (
                            <motion.button
                              animate={{ opacity: 1, x: 0 }}
                              className={cn(
                                'hover:bg-brand-gradient bg-gray-350 flex items-center gap-2 rounded-lg px-2 py-1 text-xs text-white',
                              )}
                              exit={{ opacity: 0, x: -10 }}
                              initial={{ opacity: 0, x: -10 }}
                              key={workflow.name}
                              onClick={() => {
                                setWorkflowSelected(workflow);
                              }}
                              type="button"
                            >
                              <WorkflowPlaygroundIcon className="h-3 w-3" />
                              {formatText(workflow.name)}
                            </motion.button>
                          ))}
                      </div>
                    </motion.div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </Form>
      </div>
    </div>
  );
}
