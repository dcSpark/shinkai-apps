import { ChatConversationMessage } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/types';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  buttonVariants,
  CopyToClipboardIcon,
  MarkdownPreview,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { RotateCcw } from 'lucide-react';
import React from 'react';

import shinkaiMiniLogo from '../../assets/icons/shinkai-min.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { sendMessage } from '../../service-worker/communication/internal';
import { ServiceWorkerInternalMessageType } from '../../service-worker/communication/internal/types';
import { FileList } from '../file-list/file-list';

type MessageProps = {
  message: ChatConversationMessage;
  isLastMessage?: boolean;
  regenerateLastMessage: () => void;
};
const copyToClipboard = (content: string) => {
  sendMessage({
    type: ServiceWorkerInternalMessageType.CopyToClipboard,
    data: { content: content },
  });
};

export const Message = ({
  message,
  isLastMessage,
  regenerateLastMessage,
}: MessageProps) => {
  const openMarkdownLink = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    url?: string,
  ) => {
    event.preventDefault();
    if (!url) return;
    sendMessage({
      type: ServiceWorkerInternalMessageType.OpenLink,
      data: { url },
    });
  };
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
          <img alt="Shinkai AI" src={srcUrlResolver(shinkaiMiniLogo)} />
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
            onCopyClipboard={() => copyToClipboard(message.content)}
            string={message.content}
          />
        )}
        <MarkdownPreview
          components={{
            a: ({ node, ...props }) => (
              // eslint-disable-next-line jsx-a11y/anchor-has-content
              <a
                {...props}
                onClick={(event) => openMarkdownLink(event, props.href)}
              />
            ),
          }}
          source={message.content}
        />
        {isLastMessage && (
          <button
            className={cn('mt-2 h-7 w-7 rounded-full bg-gray-500 p-2')}
            onClick={regenerateLastMessage}
          >
            <RotateCcw className="h-full w-full" />
            <span className="sr-only">Regenerate</span>
          </button>
        )}
        {!!message.fileInbox?.files?.length && (
          <FileList
            actions={[]}
            className="mt-2 w-full min-w-[200px]"
            files={message.fileInbox?.files}
          />
        )}
      </div>
    </div>
  );
};
