import { ChatConversationMessage } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/types';
import { CopyToClipboardIcon } from '@shinkai_network/shinkai-ui';
import MarkdownPreview from '@uiw/react-markdown-preview';

import shinkaiMiniLogo from '../../assets/icons/shinkai-min.svg';
import { cn } from '../../helpers/cn-utils';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { sendMessage } from '../../service-worker/communication/internal';
import { ServiceWorkerInternalMessageType } from '../../service-worker/communication/internal/types';
import { FileList } from '../file-list/file-list';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

type MessageProps = {
  message: ChatConversationMessage;
};
const copyToClipboard = (content: string) => {
  sendMessage({
    type: ServiceWorkerInternalMessageType.CopyToClipboard,
    data: { content: content },
  });
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
          <img alt="Shinkai AI" src={srcUrlResolver(shinkaiMiniLogo)} />
        )}
        <AvatarFallback className="h-8 w-8" />
      </Avatar>
      <div
        className={cn(
          'group relative mt-1 flex flex-col rounded-lg bg-transparent px-2.5 py-3 text-sm text-white',
          message.isLocal
            ? 'rounded-tr-none bg-gray-300'
            : 'rounded-bl-none border-none bg-gray-200',
        )}
      >
        {message.isLocal ? null : (
          <CopyToClipboardIcon
            className="duration-30 absolute right-3 bg-gray-300 opacity-0 group-hover:opacity-100 group-hover:transition-opacity"
            onCopyClipboard={() => copyToClipboard(message.content)}
            string={message.content}
          />
        )}
        <MarkdownPreview
          className="wmde-markdown-var"
          source={message.content}
          wrapperElement={{ 'data-color-mode': 'dark' }}
        />
        {!!message.fileInbox?.files?.length && (
          <FileList
            actions={[]}
            className="w-[200px]"
            files={message.fileInbox?.files}
          />
        )}
      </div>
    </div>
  );
};
