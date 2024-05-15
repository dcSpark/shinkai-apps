import type { ShinkaiMessage } from '@shinkai_network/shinkai-message-ts/models';
import { MessageSchemaType } from '@shinkai_network/shinkai-message-ts/models';
import { extractErrorPropertyOrContent } from '@shinkai_network/shinkai-message-ts/utils';
import { ChatConversationMessage } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/types';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  CopyToClipboardIcon,
  MarkdownPreview,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';

import icon from '../../assets/icon.png';
import { FileList } from '../../pages/create-job';

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

const Message = ({ message }: { message: ChatConversationMessage }) => {
  return (
    <div
      className={cn(
        'flex w-[95%] items-start gap-3',
        message.isLocal
          ? 'ml-auto mr-0 flex-row-reverse space-x-reverse'
          : 'ml-0 mr-auto flex-row items-end',
      )}
      key={message.scheduledTime}
    >
      <Avatar className="h-8 w-8">
        {message.isLocal ? (
          <AvatarImage alt={''} src={message.sender.avatar} />
        ) : (
          <img alt="shinkai logo" className="h-8 w-8 shrink-0" src={icon} />
        )}
        <AvatarFallback className="h-8 w-8" />
      </Avatar>
      <div
        className={cn(
          'group relative mt-1 flex flex-col overflow-hidden rounded-lg bg-transparent px-2.5 py-3 !text-sm text-white',
          message.isLocal
            ? 'rounded-tr-none bg-gray-300'
            : 'rounded-bl-none border-none bg-gray-200',
        )}
      >
        <MarkdownPreview
          source={extractErrorPropertyOrContent(
            message.content,
            'error_message',
          )}
        />

        {message.isLocal ? null : (
          <CopyToClipboardIcon
            className="duration-30 absolute right-2 top-2 bg-gray-300 opacity-0 group-hover:opacity-100 group-hover:transition-opacity"
            string={extractErrorPropertyOrContent(
              message.content,
              'error_message',
            )}
          />
        )}
        {!!message.fileInbox?.files?.length && (
          <FileList
            className="mt-3 max-w-[280px]"
            files={message.fileInbox?.files}
          />
        )}
      </div>
    </div>
  );
};
export default Message;
