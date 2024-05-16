import { extractErrorPropertyOrContent } from '@shinkai_network/shinkai-message-ts/utils/shinkai_message_handler';
import { ChatConversationMessage } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/types';
import React from 'react';

import { appIcon } from '../../assets';
import { copyToClipboard } from '../../helpers/copy-to-clipboard';
import { cn } from '../../utils';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { CopyToClipboardIcon } from '../copy-to-clipboard-icon';
import { MarkdownPreview } from '../markdown-preview';
import { FileList } from './files-preview';

type MessageProps = {
  message: ChatConversationMessage;
};

export const Message = ({ message }: MessageProps) => {
  return (
    <div
      className={cn(
        'flex flex-row space-x-2',
        message.isLocal
          ? 'ml-auto mr-0 flex-row-reverse space-x-reverse'
          : 'ml-0 mr-auto flex-row items-end',
      )}
    >
      <Avatar className="h-8 w-8">
        {message.isLocal ? (
          <AvatarImage alt={''} src={message.sender.avatar} />
        ) : (
          <img alt="Shinkai AI" src={appIcon} />
        )}
        <AvatarFallback className="h-8 w-8" />
      </Avatar>
      <div
        className={cn(
          'group relative mt-1 flex flex-col overflow-hidden rounded-lg bg-transparent px-2.5 py-3 text-sm text-white',
          message.isLocal
            ? 'rounded-tr-none bg-gray-300'
            : 'rounded-bl-none border-none bg-gray-200',
        )}
      >
        {message.isLocal ? null : (
          <CopyToClipboardIcon
            className="duration-30 absolute right-2 top-2 bg-gray-300 opacity-0 group-hover:opacity-100 group-hover:transition-opacity"
            onCopyClipboard={() => {
              copyToClipboard(
                extractErrorPropertyOrContent(message.content, 'error_message'),
              );
            }}
            string={extractErrorPropertyOrContent(
              message.content,
              'error_message',
            )}
          />
        )}
        <MarkdownPreview
          components={{
            a: ({ node, ...props }) => (
              // eslint-disable-next-line jsx-a11y/anchor-has-content
              <a {...props} target="_blank" />
            ),
          }}
          source={extractErrorPropertyOrContent(
            message.content,
            'error_message',
          )}
        />
        {!!message.fileInbox?.files?.length && (
          <FileList
            className="mt-2 w-full min-w-[200px]"
            files={message.fileInbox?.files}
          />
        )}
      </div>
    </div>
  );
};
