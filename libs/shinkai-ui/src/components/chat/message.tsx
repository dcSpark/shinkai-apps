import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  ToolArgs,
  ToolStatusType,
} from '@shinkai_network/shinkai-message-ts/api/general/types';
import { FormattedChatMessage } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/types';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Edit3, Loader2, RotateCcw, XCircle } from 'lucide-react';
import { InfoCircleIcon } from 'primereact/icons/infocircle';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { appIcon, ToolsIcon } from '../../assets';
import { formatText } from '../../helpers/format-text';
import { cn } from '../../utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../accordion';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { Button } from '../button';
import { CopyToClipboardIcon } from '../copy-to-clipboard-icon';
import { DotsLoader } from '../dots-loader';
import { Form, FormField } from '../form';
import { MarkdownPreview } from '../markdown-preview';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip';
import { ChatInputArea } from './chat-input-area';
import { FileList } from './files-preview';
import { PythonCodeRunner } from './python-code-runner/python-code-runner';

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
  isPending?: boolean;
  message: FormattedChatMessage;
  handleRetryMessage?: () => void;
  disabledRetry?: boolean;
  disabledEdit?: boolean;
  handleEditMessage?: (message: string, workflowName?: string) => void;
  messageExtra?: React.ReactNode;
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

export const editMessageFormSchema = z.object({
  message: z.string().min(1),
});

type EditMessageFormSchema = z.infer<typeof editMessageFormSchema>;

export const Message = ({
  message,
  isPending,
  handleRetryMessage,
  disabledRetry,
  disabledEdit,
  handleEditMessage,
}: MessageProps) => {
  const { t } = useTranslation();

  const [editing, setEditing] = useState(false);
  const editMessageForm = useForm<EditMessageFormSchema>({
    resolver: zodResolver(editMessageFormSchema),
    defaultValues: {
      message: message.content,
    },
  });

  const { message: currentMessage } = editMessageForm.watch();

  const onSubmit = async (data: z.infer<typeof editMessageFormSchema>) => {
    handleEditMessage?.(data.message, message.workflowName);
    setEditing(false);
  };

  useEffect(() => {
    editMessageForm.reset({ message: message.content });
  }, [editMessageForm, message.content]);

  const pythonCode = useMemo(() => {
    if (containsPythonCode(message.content)) {
      const match = message.content.match(/```python\s([\s\S]*?)```/);
      return match ? match[1] : null;
    }
    return null;
  }, [message.content]);

  const hasToolProcessing =
    message.toolCalls &&
    message.toolCalls.some((tool) => tool.status === ToolStatusType.Running);

  return (
    <motion.div
      animate="rest"
      className="pb-10"
      initial="rest"
      whileHover="hover"
    >
      <div
        className={cn(
          'relative flex flex-row space-x-2',
          message.isLocal
            ? 'ml-auto mr-0 flex-row-reverse space-x-reverse'
            : 'ml-0 mr-auto flex-row items-end',
        )}
      >
        <Avatar className={cn('mt-1 h-8 w-8')}>
          {message.isLocal ? (
            <AvatarImage alt={''} src={message.sender.avatar} />
          ) : (
            <img alt="Shinkai AI" src={appIcon} />
          )}
          <AvatarFallback className="h-8 w-8" />
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
                              <InfoCircleIcon className="h-3 w-3 text-gray-100" />
                              <span>{t('chat.editMessage.warning')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                className="min-w-[90px] rounded-lg"
                                onClick={() => setEditing(false)}
                                size="sm"
                                variant="outline"
                              >
                                {t('common.cancel')}
                              </Button>
                              <Button
                                className="min-w-[90px] rounded-lg"
                                disabled={!currentMessage}
                                onClick={editMessageForm.handleSubmit(onSubmit)}
                                size="sm"
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
              {!isPending && (
                <motion.div
                  className={cn(
                    'absolute -top-[14px] flex items-center justify-end gap-1.5 text-xs text-gray-100',
                    message.isLocal ? 'right-10' : 'left-10',
                  )}
                  variants={actionBar}
                >
                  {format(new Date(message?.scheduledTime ?? ''), 'p')}
                </motion.div>
              )}

              <div
                className={cn(
                  'relative mt-1 flex flex-col rounded-lg bg-black/40 px-3.5 pt-3 text-sm text-white',
                  message.isLocal
                    ? 'rounded-tr-none bg-gray-300'
                    : 'rounded-bl-none border-none bg-gray-200',
                  !message.content ? 'pb-3' : 'pb-4',
                  editing && 'w-full py-1',
                  !message.isLocal &&
                    isPending &&
                    'relative overflow-hidden pb-4 before:absolute before:bottom-0 before:left-0 before:right-0 before:h-10 before:animate-pulse before:bg-gradient-to-l before:from-gray-200 before:to-gray-200/10',
                )}
              >
                {message.content ? (
                  <Fragment>
                    {message.toolCalls && message.toolCalls.length > 0 && (
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
                                  'transition-colors hover:bg-gray-500 [&>svg]:hidden [&[data-state=open]]:bg-gray-500',
                                )}
                              >
                                <ToolCard
                                  args={tool.args}
                                  name={tool.name}
                                  status={tool.status}
                                />
                              </AccordionTrigger>
                              <AccordionContent className="bg-gray-450 rounded-b-lg px-3 pb-3 pt-2 text-xs">
                                {Object.keys(tool.args).length > 0 && (
                                  <span className="font-medium text-white">
                                    {tool.name}(
                                    {Object.keys(tool.args).length > 0 && (
                                      <span className="text-gray-80 font-medium">
                                        {JSON.stringify(tool.args)}
                                      </span>
                                    )}
                                    )
                                  </span>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    )}

                    <MarkdownPreview
                      source={extractErrorPropertyOrContent(
                        message.content,
                        'error_message',
                      )}
                    />
                    {pythonCode && <PythonCodeRunner code={pythonCode} />}
                    {!!message.fileInbox?.files?.length && (
                      <FileList
                        className="mt-2 min-w-[200px] max-w-[70vw]"
                        files={message.fileInbox?.files}
                      />
                    )}
                    {!!message.workflowName && (
                      <div className="mt-2 flex items-center gap-1.5 border-t pt-1.5">
                        <span className="text-gray-80 text-xs">Workflow:</span>
                        <span className="text-gray-80 text-xs">
                          {message.workflowName}
                        </span>
                      </div>
                    )}
                  </Fragment>
                ) : (
                  <DotsLoader className="pt-1" />
                )}
              </div>
              {!isPending && (
                <motion.div
                  className={cn(
                    'absolute -bottom-[34px] flex items-end justify-end gap-1.5',
                    message.isLocal ? 'right-10' : 'left-10',
                  )}
                  variants={actionBar}
                >
                  {message.isLocal && !disabledEdit && (
                    <TooltipProvider delayDuration={0}>
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
                    </TooltipProvider>
                  )}
                  {!message.isLocal && !disabledRetry && (
                    <TooltipProvider delayDuration={0}>
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
                    </TooltipProvider>
                  )}
                  <TooltipProvider delayDuration={0}>
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
                  </TooltipProvider>
                </motion.div>
              )}
            </Fragment>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export function ToolCard({
  name,
  args,
  status,
}: {
  args: ToolArgs;
  status: ToolStatusType;
  name: string;
}) {
  const renderStatus = () => {
    if (status === ToolStatusType.Complete) {
      return <ToolsIcon className="text-brand size-full" />;
    }
    if (status === ToolStatusType.Incomplete) {
      return <XCircle className="text-gray-80 size-full" />;
    }
    if (status === ToolStatusType.RequiresAction) {
      return <InfoCircleIcon className="text-gray-80 size-full" />;
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
    <div className="flex items-center gap-1 rounded-lg p-[5px]">
      <div className="size-7 shrink-0 px-1.5">{renderStatus()}</div>
      <div className="flex items-center gap-1">
        <span className="text-gray-80 text-xs">{renderLabelText()}</span>
        <span className="text-gray-white text-xs font-semibold">
          {formatText(name)}
        </span>
      </div>
    </div>
  );
}
