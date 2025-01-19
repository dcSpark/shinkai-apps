import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  ToolArgs,
  ToolStatusType,
} from '@shinkai_network/shinkai-message-ts/api/general/types';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils';
import { FormattedMessage } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Avatar,
  AvatarFallback,
  Button,
  Card,
  CardContent,
  ChatInputArea,
  CopyToClipboardIcon,
  DotsLoader,
  FileList,
  Form,
  FormField,
  MarkdownText,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  appIcon,
  ReactJsIcon,
  ToolsIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Edit3,
  InfoIcon,
  Loader2,
  RotateCcw,
  Unplug,
  XCircle,
} from 'lucide-react';
import React, { Fragment, memo, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { useAuth } from '../../../store/auth';
import { useOAuth } from '../../../store/oauth';
import { oauthUrlMatcherFromErrorMessage } from '../../../utils/oauth';
import { useChatStore } from '../context/chat-context';
import { PythonCodeRunner } from '../python-code-runner/python-code-runner';

export const extractErrorPropertyOrContent = (
  content: string,
  property: 'error' | 'error_message',
) => {
  try {
    const parsedContent = JSON.parse(content);
    if (property in parsedContent) {
      return parsedContent[property];
    }
  } catch {
    /* ignore */
  }
  return String(content);
};

const containsPythonCode = (content: string): boolean => {
  const pythonCodeRegex = /```python\s[\s\S]*?```/;
  return pythonCodeRegex.test(content);
};

type MessageProps = {
  messageId: string;
  isPending?: boolean;
  message: FormattedMessage;
  handleRetryMessage?: () => void;
  disabledRetry?: boolean;
  disabledEdit?: boolean;
  handleEditMessage?: (message: string) => void;
  messageExtra?: React.ReactNode;
  hidePythonExecution?: boolean;
};

const actionBar = {
  rest: {
    opacity: 0,
    scale: 0.8,
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.3,
    },
  },
  hover: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      duration: 0.3,
      bounce: 0,
    },
  },
};

type ArtifactProps = {
  title: string;
  type: string;
  identifier: string;
  loading?: boolean;
  isSelected?: boolean;
  onArtifactClick?: () => void;
};
const ArtifactCard = ({
  title,
  loading = true,
  onArtifactClick,
  isSelected,
  // identifier,
}: ArtifactProps) => (
  <Card
    className={cn(
      'w-full max-w-sm border border-gray-100',
      isSelected && 'border-gray-50 bg-gray-300',
    )}
    onClick={() => {
      onArtifactClick?.();
    }}
    role="button"
  >
    <CardContent className="flex items-center gap-1 p-1 py-1.5">
      <div className="rounded-md p-2">
        {loading ? (
          <Loader2 className="text-gray-80 h-5 w-5 animate-spin" />
        ) : (
          <ReactJsIcon
            className={cn(isSelected ? 'text-gray-50' : 'text-gray-80')}
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="!mb-0 line-clamp-1 text-sm font-medium text-gray-50">
          {title}
        </p>
        <p className="text-gray-80 !mb-0 text-xs">
          {loading ? 'Generating...' : 'Click to preview'}
        </p>
      </div>
    </CardContent>
  </Card>
);

export const editMessageFormSchema = z.object({
  message: z.string().min(1),
});

type EditMessageFormSchema = z.infer<typeof editMessageFormSchema>;

export const MessageBase = ({
  message,
  // messageId,
  hidePythonExecution,
  isPending,
  handleRetryMessage,
  disabledRetry,
  disabledEdit,
  handleEditMessage,
}: MessageProps) => {
  const { t } = useTranslation();

  const selectedArtifact = useChatStore((state) => state.selectedArtifact);
  const setArtifact = useChatStore((state) => state.setSelectedArtifact);

  const [editing, setEditing] = useState(false);

  const editMessageForm = useForm<EditMessageFormSchema>({
    resolver: zodResolver(editMessageFormSchema),
    defaultValues: {
      message: message.content,
    },
  });

  const { message: currentMessage } = editMessageForm.watch();

  const onSubmit = async (data: z.infer<typeof editMessageFormSchema>) => {
    if (message.role === 'user') {
      handleEditMessage?.(data.message);
      setEditing(false);
    }
  };

  useEffect(() => {
    if (message.role === 'user') {
      editMessageForm.reset({ message: message.content });
    }
  }, [editMessageForm, message.content]);

  const pythonCode = useMemo(() => {
    if (containsPythonCode(message.content)) {
      const match = message.content.match(/```python\s([\s\S]*?)```/);
      return match ? match[1] : null;
    }
    return null;
  }, [message.content]);

  const oauthUrl = useMemo(() => {
    return oauthUrlMatcherFromErrorMessage(message.content);
  }, [message.content]);

  const { setOauthModalVisible } = useOAuth();

  const auth = useAuth((state) => state.auth);

  return (
    <motion.div
      animate="rest"
      className="pb-10"
      data-testid={`message-${
        message.role === 'user' ? 'local' : 'remote'
      }-${message.messageId}`}
      id={message.messageId}
      initial="rest"
      whileHover="hover"
    >
      <div
        className={cn(
          'relative flex flex-row space-x-2',
          message.role === 'user' &&
            'ml-auto mr-0 flex-row-reverse space-x-reverse',
          message.role === 'assistant' && 'ml-0 mr-auto flex-row items-end',
        )}
      >
        <Avatar className={cn('mt-1 h-8 w-8')}>
          {message.role === 'assistant' ? (
            <img alt="Shinkai AI" src={appIcon} />
          ) : (
            <AvatarFallback className="h-8 w-8 bg-[#313336] text-xs text-[#b0b0b0]">
              U
            </AvatarFallback>
          )}
        </Avatar>
        <div
          className={cn(
            'flex flex-col overflow-hidden bg-transparent text-sm text-white',
            editing && 'w-full py-1',
          )}
        >
          {editing ? (
            <Form {...editMessageForm}>
              <form
                className="relative flex items-center"
                onSubmit={editMessageForm.handleSubmit(onSubmit)}
              >
                <div className="w-full">
                  <FormField
                    control={editMessageForm.control}
                    name="message"
                    render={({ field }) => (
                      <ChatInputArea
                        bottomAddons={
                          <div className="flex w-full items-center justify-between px-1">
                            <div className="flex items-center gap-1 text-xs text-gray-100">
                              <InfoIcon className="h-3 w-3 text-gray-100" />
                              <span>{t('chat.editMessage.warning')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                className="min-w-[90px]"
                                onClick={() => setEditing(false)}
                                rounded="lg"
                                size="xs"
                                variant="outline"
                              >
                                {t('common.cancel')}
                              </Button>
                              <Button
                                className="min-w-[90px]"
                                disabled={!currentMessage}
                                onClick={editMessageForm.handleSubmit(onSubmit)}
                                rounded="lg"
                                size="xs"
                              >
                                {t('common.send')}
                              </Button>
                            </div>
                          </div>
                        }
                        onChange={field.onChange}
                        onSubmit={editMessageForm.handleSubmit(onSubmit)}
                        value={field.value}
                      />
                    )}
                  />
                </div>
              </form>
            </Form>
          ) : (
            <Fragment>
              <div
                className={cn(
                  'relative mt-1 flex flex-col rounded-lg bg-black/40 px-3.5 pt-3 text-sm text-white',
                  message.role === 'user'
                    ? 'rounded-tr-none bg-gray-300'
                    : 'rounded-bl-none border-none bg-gray-200',
                  !message.content ? 'pb-3' : 'pb-4',
                  editing && 'w-full py-1',
                  message.role === 'assistant' &&
                    isPending &&
                    'relative overflow-hidden pb-4 before:absolute before:bottom-0 before:left-0 before:right-0 before:h-10 before:animate-pulse before:bg-gradient-to-l before:from-gray-200 before:to-gray-200/10',
                )}
              >
                {message.role === 'assistant' &&
                  message.toolCalls &&
                  message.toolCalls.length > 0 && (
                    <Accordion
                      className="space-y-1.5 self-baseline pb-3"
                      type="multiple"
                    >
                      {message.toolCalls.map((tool) => {
                        return (
                          <AccordionItem
                            className="bg-app-gradient overflow-hidden rounded-lg"
                            disabled={tool.status !== ToolStatusType.Complete}
                            key={tool.name}
                            value={tool.name}
                          >
                            <AccordionTrigger
                              className={cn(
                                'min-w-[10rem] py-0 pr-2 no-underline hover:no-underline',
                                'transition-colors hover:bg-gray-500 [&[data-state=open]]:bg-gray-500',
                                tool.status !== ToolStatusType.Complete &&
                                  '[&>svg]:hidden',
                              )}
                            >
                              <ToolCard
                                args={tool.args}
                                name={tool.name}
                                status={tool.status ?? ToolStatusType.Complete}
                                toolRouterKey={tool.toolRouterKey}
                              />
                            </AccordionTrigger>
                            <AccordionContent className="bg-gray-450 flex flex-col gap-1 rounded-b-lg px-3 pb-3 pt-2 text-xs">
                              {Object.keys(tool.args).length > 0 && (
                                <span className="font-medium text-white">
                                  {tool.name}(
                                  {Object.keys(tool.args).length > 0 && (
                                    <span className="text-gray-80 font-mono font-medium">
                                      {JSON.stringify(tool.args)}
                                    </span>
                                  )}
                                  )
                                </span>
                              )}
                              {tool.result && (
                                <div>
                                  <span>Response:</span>
                                  <span className="text-gray-80 break-all font-mono">
                                    {JSON.stringify(tool.result, null, 2)}
                                  </span>
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  )}
                {message.role === 'assistant' && (
                  <MarkdownText
                    content={extractErrorPropertyOrContent(
                      message.content,
                      'error_message',
                    )}
                    isRunning={
                      !!message.content && message.status.type === 'running'
                    }
                  />
                )}
                {message.role === 'assistant' &&
                  message.artifacts?.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-3">
                      {message.artifacts.map((artifact) => (
                        <ArtifactCard
                          identifier={artifact.identifier}
                          isSelected={
                            selectedArtifact?.identifier === artifact.identifier
                          }
                          key={artifact.identifier}
                          loading={false}
                          onArtifactClick={() => {
                            if (
                              selectedArtifact?.identifier ===
                              artifact.identifier
                            ) {
                              setArtifact(null);
                              return;
                            }
                            setArtifact(artifact);
                          }}
                          title={artifact.title}
                          type={artifact.type}
                        />
                      ))}
                    </div>
                  )}
                {message.role === 'user' && (
                  <div className="whitespace-pre-line">{message.content}</div>
                )}
                {message.role === 'assistant' &&
                  message.status.type === 'running' &&
                  message.content === '' && (
                    <div className="whitespace-pre-line pt-1.5">
                      <DotsLoader />
                    </div>
                  )}
                {pythonCode && !hidePythonExecution && (
                  <PythonCodeRunner
                    code={pythonCode}
                    jobId={extractJobIdFromInbox(
                      message.metadata.inboxId ?? '',
                    )}
                    nodeAddress={auth?.node_address ?? ''}
                    token={auth?.api_v2_key ?? ''}
                  />
                )}

                {oauthUrl && (
                  <div className="mt-4 flex flex-col items-start rounded-lg bg-gray-900 p-4 shadow-md">
                    <p className="mb-2 text-lg font-semibold text-white">
                      <div className="flex items-center">
                        <Unplug className="mr-2 h-5 w-5" />
                        {t('oauth.connectionRequired')}
                      </div>
                    </p>
                    <p className="mb-4 text-sm text-white">
                      {t('oauth.connectionRequiredDescription', {
                        provider: new URL(oauthUrl).hostname,
                      })}
                    </p>
                    <Button
                      className="rounded-lg px-4 py-2 text-white transition duration-300"
                      onClick={() =>
                        setOauthModalVisible({ visible: true, url: oauthUrl })
                      }
                      variant="outline"
                    >
                      {t('oauth.connectNow')}
                    </Button>
                  </div>
                )}

                {message.role === 'user' && !!message.attachments.length && (
                  <FileList
                    className="mt-2 min-w-[200px] max-w-[70vw]"
                    files={message.attachments}
                  />
                )}
                {message.role === 'user' && message.workflowName && (
                  <div className="mt-2 flex items-center gap-1.5 border-t pt-1.5">
                    <span className="text-gray-80 text-xs">Workflow:</span>
                    <span className="text-gray-80 text-xs">
                      {message.workflowName}
                    </span>
                  </div>
                )}
              </div>
              {!isPending && (
                <motion.div
                  className={cn(
                    'absolute -bottom-[34px] flex items-center justify-end gap-3',
                    message.role === 'user'
                      ? 'right-10 flex-row-reverse'
                      : 'left-10 flex-row',
                  )}
                  variants={actionBar}
                >
                  <div className="flex items-center gap-1.5">
                    {message.role === 'user' && !disabledEdit && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className={cn(
                              'text-gray-80 flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-transparent transition-colors hover:bg-gray-300 hover:text-white [&>svg]:h-3 [&>svg]:w-3',
                            )}
                            onClick={() => {
                              setEditing(true);
                            }}
                          >
                            <Edit3 />
                          </button>
                        </TooltipTrigger>
                        <TooltipPortal>
                          <TooltipContent>
                            <p>{t('common.editMessage')}</p>
                          </TooltipContent>
                        </TooltipPortal>
                      </Tooltip>
                    )}
                    {message.role === 'assistant' && !disabledRetry && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className={cn(
                              'text-gray-80 flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-transparent transition-colors hover:bg-gray-300 hover:text-white [&>svg]:h-3 [&>svg]:w-3',
                            )}
                            onClick={handleRetryMessage}
                          >
                            <RotateCcw />
                          </button>
                        </TooltipTrigger>
                        <TooltipPortal>
                          <TooltipContent>
                            <p>{t('common.retry')}</p>
                          </TooltipContent>
                        </TooltipPortal>
                      </Tooltip>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <CopyToClipboardIcon
                            className={cn(
                              'text-gray-80 h-7 w-7 border border-gray-200 bg-transparent hover:bg-gray-300 [&>svg]:h-3 [&>svg]:w-3',
                            )}
                            string={extractErrorPropertyOrContent(
                              message.content,
                              'error_message',
                            )}
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
                  <div
                    className={cn(
                      'flex items-center gap-1.5 text-xs text-gray-100',
                    )}
                  >
                    <span>
                      {format(new Date(message?.createdAt ?? ''), 'p')}
                    </span>
                    {message.role === 'assistant' && message?.metadata?.tps && (
                      <>
                        {' '}
                        ⋅
                        <span>
                          {Math.round(Number(message?.metadata?.tps) * 10) / 10}{' '}
                          tokens/s
                        </span>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </Fragment>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const Message = memo(MessageBase, (prev, next) => {
  return (
    prev.messageId === next.messageId &&
    prev.message.content === next.message.content
  );
});

const variants = {
  initial: { opacity: 0, y: -25 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 25 },
};

export function ToolCard({
  name,
  // args,
  status,
  toolRouterKey,
}: {
  args: ToolArgs;
  status: ToolStatusType;
  name: string;
  toolRouterKey: string;
}) {
  const renderStatus = () => {
    if (status === ToolStatusType.Complete) {
      return <ToolsIcon className="text-brand size-full" />;
    }
    if (status === ToolStatusType.Incomplete) {
      return <XCircle className="text-gray-80 size-full" />;
    }
    if (status === ToolStatusType.RequiresAction) {
      return <InfoIcon className="text-gray-80 size-full" />;
    }
    return <Loader2 className="text-brand size-full animate-spin" />;
  };

  const renderLabelText = () => {
    if (status === ToolStatusType.Complete) {
      return 'Tool Used';
    }
    if (status === ToolStatusType.Incomplete) {
      return 'Incomplete';
    }
    if (status === ToolStatusType.RequiresAction) {
      return 'Requires Action';
    }
    return 'Processing Tool';
  };

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.div
        animate="visible"
        exit="exit"
        initial="initial"
        transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
        variants={variants}
      >
        <div className="flex items-center gap-1 p-[5px]">
          <div className="size-7 shrink-0 px-1.5">{renderStatus()}</div>
          <div className="flex items-center gap-1">
            <span className="text-gray-80 text-xs">{renderLabelText()}</span>
            <Link
              className="text-gray-white text-xs font-semibold hover:underline"
              to={`/tools/${toolRouterKey}`}
            >
              {formatText(name)}
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
