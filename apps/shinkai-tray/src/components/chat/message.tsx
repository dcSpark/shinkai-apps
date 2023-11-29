import type { ShinkaiMessage } from '@shinkai_network/shinkai-message-ts/models';
import { MessageSchemaType } from '@shinkai_network/shinkai-message-ts/models';
import { ChatConversationMessage } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/types';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  CopyToClipboardIcon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import MarkdownPreview from '@uiw/react-markdown-preview';

import { cn } from '../../lib/utils';

export const getMessageFilesInbox = (
  message: ShinkaiMessage,
): string | undefined => {
  // unnencrypted content
  if (
    message.body &&
    'unencrypted' in message.body &&
    'unencrypted' in message.body.unencrypted.message_data
  ) {
    const isJobMessage =
      message.body.unencrypted.message_data.unencrypted
        .message_content_schema === MessageSchemaType.JobMessageSchema;
    // job message
    if (isJobMessage) {
      try {
        const parsedMessage = JSON.parse(
          message.body.unencrypted.message_data.unencrypted.message_raw_content,
        );
        return parsedMessage?.files_inbox;
      } catch (error) {
        console.log('error parsing message raw content', error);
      }
    }
  }
  return undefined;
};

const Message = ({
  message,
  inboxId,
}: {
  message: ChatConversationMessage;
  inboxId: string;
}) => {
  return (
    <div
      className={cn(
        'flex w-[95%] items-start gap-3',
        message.isLocal
          ? 'ml-0 mr-auto flex-row'
          : 'ml-auto mr-0 flex-row-reverse',
      )}
      key={message.scheduledTime}
    >
      <Avatar className="mt-1 h-8 w-8">
        <AvatarImage
          alt={message.isLocal ? inboxId : 'Shinkai AI'}
          src={
            message.isLocal
              ? `https://ui-avatars.com/api/?name=${inboxId}&background=0b1115&color=c7c7c7`
              : `https://ui-avatars.com/api/?name=S&background=FF5E5F&color=fff`
          }
        />
        <AvatarFallback className="h-8 w-8" />
      </Avatar>
      <div
        className={cn(
          'group flex items-start gap-1 overflow-x-hidden break-words rounded-lg bg-transparent px-2.5 py-3',
          message.isLocal
            ? 'rounded-tl-none border border-slate-800'
            : 'rounded-tr-none border-none bg-[rgba(217,217,217,0.04)]',
        )}
      >
        <MarkdownPreview
          className="!text-foreground !bg-transparent !text-sm"
          source={`${
            message.fileInbox?.files?.length
              ? `<svg xmlns="http://www.w3.org/2000/svg" className="mb-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>`
              : ''
          } ${message.content}`}
          wrapperElement={{ 'data-color-mode': 'dark' }}
        />
        {message.isLocal ? null : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <CopyToClipboardIcon
                  className="duration-30 -mr-1 -mt-1 opacity-0 group-hover:opacity-100 group-hover:transition-opacity"
                  string={message.content}
                />
              </TooltipTrigger>
              <TooltipContent>Copy</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};
export default Message;
