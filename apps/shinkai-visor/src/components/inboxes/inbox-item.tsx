import {
  ShinkaiMessage,
  SmartInbox,
} from '@shinkai_network/shinkai-message-ts/models';
import {
  getMessageContent,
  isJobInbox,
} from '@shinkai_network/shinkai-message-ts/utils';
import { useArchiveJob } from '@shinkai_network/shinkai-node-state/lib/mutations/archiveJob/useArchiveJob';
import { formatDateToMonthAndDay } from '@shinkai_network/shinkai-node-state/lib/utils/date';
import {
  ArchiveIcon,
  Button,
  ChatBubbleIcon,
  JobBubbleIcon,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
  useToast,
} from '@shinkai_network/shinkai-ui';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { useAuth } from '../../store/auth/auth';

const InboxItem = ({
  inbox,
  actions,
}: {
  inbox: SmartInbox;
  actions?: {
    label: string;
    onClick: (event: React.MouseEvent, inbox: SmartInbox) => void;
  }[];
}) => {
  const history = useHistory();

  const navigateToInbox = (inbox: {
    inbox_id: string;
    custom_name: string;
    last_message?: ShinkaiMessage;
  }) => {
    history.push(`/inboxes/${encodeURIComponent(inbox.inbox_id)}`, { inbox });
  };

  return (
    <Button
      className="group h-14 w-full rounded-none bg-transparent px-1 hover:bg-transparent"
      key={inbox.inbox_id}
      onClick={() => navigateToInbox(inbox)}
      variant="ghost"
    >
      <div className="flex w-full items-center justify-between gap-4">
        <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-gray-300">
          {isJobInbox(decodeURIComponent(inbox.inbox_id)) ? (
            <JobBubbleIcon />
          ) : (
            <ChatBubbleIcon className="h-4 w-4 shrink-0" />
          )}
        </span>
        <div className="flex-auto overflow-hidden">
          <div className="flex flex-col space-y-1">
            <span className="truncate text-left text-white">
              {inbox.custom_name}
            </span>
            <div className="truncate text-left text-xs text-gray-100">
              {inbox.last_message && getMessageContent(inbox.last_message)}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="shrink-0 self-start whitespace-nowrap text-end text-xs lowercase text-gray-100">
            {inbox.last_message?.external_metadata?.scheduled_time &&
              formatDateToMonthAndDay(
                new Date(inbox.last_message.external_metadata.scheduled_time),
              )}
          </span>
          {!!actions?.length && (
            <div className="translate-x-full transition duration-200 group-hover:translate-x-0">
              {actions.map((action) => (
                <TooltipProvider delayDuration={0} key={action.label}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="hover:text-gray-80 shrink-0 bg-inherit hover:bg-inherit"
                        onClick={(event) => action.onClick(event, inbox)}
                        size={'icon'}
                        variant={'ghost'}
                      >
                        <ArchiveIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent>
                        <p>Archive</p>
                      </TooltipContent>
                    </TooltipPortal>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
        </div>
        {/*<Button*/}
        {/*  className="absolute right-0 top-0 hidden shrink-0 hover:bg-gray-500 group-hover:flex"*/}
        {/*  onClick={(event) =>*/}
        {/*    editInboxNameClick(*/}
        {/*      event,*/}
        {/*      inbox.inbox_id,*/}
        {/*      inbox.custom_name,*/}
        {/*    )*/}
        {/*  }*/}
        {/*  size={'icon'}*/}
        {/*  variant={'ghost'}*/}
        {/*>*/}
        {/*  <Edit3 className="h-4 w-4" />*/}
        {/*</Button>*/}
      </div>
    </Button>
  );
};

const ActiveInboxItem = ({ inbox }: { inbox: SmartInbox }) => {
  const auth = useAuth((state) => state.auth);

  const { toast } = useToast();
  const { mutateAsync: archiveJob } = useArchiveJob({
    onSuccess: () => {
      toast({
        variant: 'success',
        title: 'Your conversation has been archived',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error archiving job',
        description: error.message,
        duration: 3000,
      });
    },
  });

  const handleArchiveJob = async (
    event: React.MouseEvent,
    inbox: SmartInbox,
  ) => {
    event.stopPropagation();
    await archiveJob({
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      profile: auth?.profile ?? '',
      inboxId: inbox.inbox_id,
      my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
      my_device_identity_sk: auth?.my_device_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    });
  };

  return (
    <InboxItem
      actions={[
        {
          label: 'Archive',
          onClick: (event, inbox) => {
            handleArchiveJob(event, inbox);
          },
        },
      ]}
      inbox={inbox}
    />
  );
};
const ArchiveInboxItem = ({ inbox }: { inbox: SmartInbox }) => {
  return <InboxItem inbox={inbox} />;
};

export { InboxItem, ActiveInboxItem, ArchiveInboxItem };
