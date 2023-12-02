import type { ShinkaiMessage } from '@shinkai_network/shinkai-message-ts/models';
import { MessageSchemaType } from '@shinkai_network/shinkai-message-ts/models';
import { ChatConversationMessage } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/types';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  CopyToClipboardIcon,
} from '@shinkai_network/shinkai-ui';
import MarkdownPreview from '@uiw/react-markdown-preview';

import { cn } from '../../lib/utils';
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
          <svg
            className="h-8 w-8 shrink-0"
            fill="none"
            height="32"
            viewBox="0 0 32 32"
            width="32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16.3099" cy="16.8099" fill="white" r="11.9606" />
            <path
              clipRule="evenodd"
              d="M31.4203 16.2868C31.4203 24.9633 24.3866 31.997 15.7102 31.997C7.03368 31.997 0 24.9633 0 16.2868C0 7.61034 7.03368 0.57666 15.7102 0.57666C24.3866 0.57666 31.4203 7.61034 31.4203 16.2868ZM25.3145 13.8076C25.9613 14.322 26.5167 14.9398 26.9589 15.6349C27.1245 15.8953 27.0202 16.2353 26.748 16.3809L24.7347 17.4582C24.4626 17.6038 24.1269 17.4983 23.945 17.2489C23.797 17.0459 23.6301 16.8569 23.4466 16.6847C23.4464 16.6846 23.4462 16.6846 23.4461 16.6848L23.4459 16.6849L23.4456 16.6848C23.0451 16.3091 22.5721 16.0192 22.0555 15.833C21.9487 15.7945 21.8405 15.7606 21.7312 15.7314C21.3075 15.6179 21.0229 16.0868 21.1872 16.4935C21.3364 16.8627 21.4505 17.2469 21.527 17.6412C21.7452 18.7659 21.6492 19.9289 21.2495 21.0026C20.8498 22.0763 20.1619 23.019 19.2614 23.7273C18.5077 24.32 17.6294 24.7293 16.6961 24.9264C16.3942 24.9901 16.1153 24.7687 16.0789 24.4622L15.8064 22.1727C15.77 21.8663 15.9919 21.5935 16.2852 21.4972C16.5951 21.3954 16.8864 21.2399 17.1451 21.0364C17.551 20.7172 17.8611 20.2923 18.0412 19.8083C18.2214 19.3244 18.2646 18.8001 18.1663 18.2932C18.0777 17.8364 17.8771 17.4096 17.5837 17.0505C17.5631 17.0254 17.5399 17.0025 17.5149 16.9817L15.4076 15.2288C15.1704 15.0314 15.1365 14.6774 15.3512 14.4556C15.9241 13.8637 16.5925 13.3702 17.3295 12.9965C17.6236 12.8473 17.9266 12.7183 18.2364 12.6099C18.6872 12.4522 19.1533 12.3379 19.6285 12.2692C20.6311 12.1245 21.6527 12.1863 22.6305 12.4508C23.6083 12.7154 24.5217 13.1771 25.3145 13.8076ZM5.73919 18.777L5.73921 18.7774L5.73923 18.7777C6.49342 19.4538 7.3779 19.9686 8.33833 20.2904C9.03893 20.5251 9.76914 20.6535 10.5047 20.6727C10.9798 20.6852 11.4562 20.652 11.9274 20.573C12.9263 20.4056 13.8805 20.0357 14.7313 19.4859L14.7313 19.4856L14.7314 19.4853C15.2532 19.1481 15.7306 18.7467 16.1526 18.2905C16.3621 18.0639 16.3203 17.7108 16.0786 17.5188L13.9349 15.8163C13.9097 15.7962 13.8861 15.7741 13.8651 15.7496C13.5622 15.3967 13.3511 14.9734 13.2519 14.5175C13.1421 14.0129 13.1735 13.4878 13.3426 12.9999C13.5117 12.512 13.8121 12.0802 14.2106 11.7519C14.4647 11.5426 14.7523 11.3805 15.0599 11.2717C15.3509 11.1688 15.5666 10.8911 15.5232 10.5855L15.199 8.30275C15.1556 7.99717 14.8718 7.78213 14.5713 7.85273C13.6427 8.0709 12.774 8.49998 12.0339 9.10966C11.1497 9.83812 10.4834 10.7962 10.1081 11.8787C9.73285 12.9611 9.66322 14.1261 9.90686 15.2455C10.0534 15.9187 10.3098 16.5598 10.663 17.1442C10.6974 17.2011 10.6574 17.2745 10.5909 17.2727C10.3033 17.265 10.0165 17.2264 9.73563 17.1572C9.20233 17.0258 8.70154 16.7868 8.26403 16.4547C7.97532 16.2356 7.71818 15.9791 7.49908 15.6925C7.31162 15.4473 6.97362 15.3494 6.70485 15.5012L4.71647 16.6238C4.4477 16.7755 4.35111 17.1178 4.52262 17.3744C4.86793 17.891 5.27666 18.3622 5.73919 18.777Z"
              fill="#FE6162"
              fillRule="evenodd"
            />
          </svg>
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
        <MarkdownPreview
          className="!text-foreground !bg-transparent !text-sm"
          source={message.content}
          wrapperElement={{ 'data-color-mode': 'dark' }}
        />

        {message.isLocal ? null : (
          <CopyToClipboardIcon
            className="duration-30 absolute right-2 top-2 bg-gray-300 opacity-0 group-hover:opacity-100 group-hover:transition-opacity"
            string={message.content}
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
