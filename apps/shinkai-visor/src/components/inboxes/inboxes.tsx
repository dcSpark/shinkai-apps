import { ArchiveIcon } from '@radix-ui/react-icons';
import { ShinkaiMessage } from '@shinkai_network/shinkai-message-ts/models';
import {
  getMessageContent,
  isJobInbox,
} from '@shinkai_network/shinkai-message-ts/utils';
import { useArchiveJob } from '@shinkai_network/shinkai-node-state/lib/mutations/archiveJob/useArchiveJob';
import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import { useGetInboxes } from '@shinkai_network/shinkai-node-state/lib/queries/getInboxes/useGetInboxes';
import { formatDateToMonthAndDay } from '@shinkai_network/shinkai-node-state/lib/utils/date';
import {
  Button,
  ChatBubbleIcon,
  JobBubbleIcon,
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
  useToast,
} from '@shinkai_network/shinkai-ui';
import { Plus } from 'lucide-react';
import { Fragment, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { useAuth } from '../../store/auth/auth';
import { EditInboxNameDialog } from '../edit-inbox-name-dialog/edit-inbox-name-dialog';
import { EmptyAgents } from '../empty-agents/empty-agents';
import { EmptyInboxes } from '../empty-inboxes/empty-inboxes';
import { Header } from '../header/header';

export const Inboxes = () => {
  const history = useHistory();
  const auth = useAuth((state) => state.auth);
  const dialContainerRef = useRef<HTMLDivElement>(null);
  // const [dialOpened, setDialOpened] = useState<boolean>(false);
  const sender = auth?.shinkai_identity ?? '';
  const [isEditInboxNameDialogOpened, setIsEditInboxNameDialogOpened] =
    useState<{ isOpened: boolean; inboxId: string; name: string }>({
      isOpened: false,
      inboxId: '',
      name: '',
    });
  const { inboxes } = useGetInboxes({
    nodeAddress: auth?.node_address ?? '',
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: auth?.profile ?? '',
    // Assuming receiver and target_shinkai_name_profile are the same as sender
    receiver: sender,
    targetShinkaiNameProfile: `${auth?.shinkai_identity}/${auth?.profile}`,
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });
  const { agents } = useAgents({
    nodeAddress: auth?.node_address ?? '',
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: `${auth?.profile}`,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });
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

  const navigateToInbox = (inbox: {
    inbox_id: string;
    custom_name: string;
    last_message?: ShinkaiMessage;
  }) => {
    history.push(`/inboxes/${encodeURIComponent(inbox.inbox_id)}`, { inbox });
  };
  const onCreateJobClick = () => {
    history.push('/inboxes/create-job');
  };
  // Temporarily disabled while shinkai-node implements networking layer
  // const onCreateInboxClick = () => {
  //   history.push('/inboxes/create-inbox');
  // };

  // const openEditInboxNameDialog = (inboxId: string, name: string) => {
  //   setIsEditInboxNameDialogOpened({
  //     isOpened: true,
  //     inboxId: decodeURIComponent(inboxId),
  //     name: name,
  //   });
  // };
  const closeEditInboxNameDialog = () => {
    setIsEditInboxNameDialogOpened({
      isOpened: false,
      inboxId: '',
      name: '',
    });
  };
  // const editInboxNameClick = (
  //   event: React.MouseEvent,
  //   inboxId: string,
  //   name: string,
  // ) => {
  //   event.stopPropagation();
  //   openEditInboxNameDialog(inboxId, name);
  // };
  return (
    <div className="flex h-full flex-col justify-between space-y-3 overflow-hidden">
      <Header title={<FormattedMessage id="inbox.other" />} />
      {!agents?.length ? (
        <EmptyAgents data-testid="empty-agents" />
      ) : !inboxes?.length ? (
        <EmptyInboxes data-testid="empty-inboxes" />
      ) : (
        <>
          <div className="flex grow flex-col overflow-hidden">
            <ScrollArea className="pr-4 [&>div>div]:!block">
              <div className="space-y-4" data-testid="inboxes-container">
                {inboxes?.map((inbox) => (
                  <Fragment key={inbox.inbox_id}>
                    <Button
                      className="group h-14 w-full rounded-none bg-transparent px-1 hover:bg-transparent"
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
                              {inbox.last_message &&
                                getMessageContent(inbox.last_message)}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="shrink-0 self-start whitespace-nowrap text-end text-xs lowercase text-gray-100">
                            {inbox.last_message?.external_metadata
                              ?.scheduled_time &&
                              formatDateToMonthAndDay(
                                new Date(
                                  inbox.last_message.external_metadata.scheduled_time,
                                ),
                              )}
                          </span>
                          <div className="translate-x-full transition duration-200 group-hover:translate-x-0">
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    className="hover:text-gray-80 shrink-0 bg-inherit hover:bg-inherit"
                                    onClick={async (event) => {
                                      event.stopPropagation();
                                      await archiveJob({
                                        nodeAddress: auth?.node_address ?? '',
                                        shinkaiIdentity:
                                          auth?.shinkai_identity ?? '',
                                        profile: auth?.profile ?? '',
                                        inboxId: inbox.inbox_id,
                                        my_device_encryption_sk:
                                          auth?.my_device_encryption_sk ?? '',
                                        my_device_identity_sk:
                                          auth?.my_device_identity_sk ?? '',
                                        node_encryption_pk:
                                          auth?.node_encryption_pk ?? '',
                                        profile_encryption_sk:
                                          auth?.profile_encryption_sk ?? '',
                                        profile_identity_sk:
                                          auth?.profile_identity_sk ?? '',
                                      });
                                      console.log('ckicked', {
                                        nodeAddress: auth?.node_address ?? '',
                                        shinkaiIdentity:
                                          auth?.shinkai_identity ?? '',
                                        profile: auth?.profile ?? '',
                                        inboxId: inbox.inbox_id,
                                        my_device_encryption_sk:
                                          auth?.my_device_encryption_sk ?? '',
                                        my_device_identity_sk:
                                          auth?.my_device_identity_sk ?? '',
                                        node_encryption_pk:
                                          auth?.node_encryption_pk ?? '',
                                        profile_encryption_sk:
                                          auth?.profile_encryption_sk ?? '',
                                        profile_identity_sk:
                                          auth?.profile_identity_sk ?? '',
                                      });
                                    }}
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
                          </div>
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
                  </Fragment>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="fixed bottom-4 right-4" ref={dialContainerRef}>
            <Button
              className="h-[60px] w-[60px]"
              onClick={() => onCreateJobClick()}
              size="icon"
            >
              <Plus />
            </Button>

            {/* Temporarily disabled while shinkai-node implements networking layer */}
            {/* <DropdownMenu onOpenChange={(isOpen) => setDialOpened(isOpen)}>
              <DropdownMenuTrigger asChild>
                <Button className="h-[60px] w-[60px]" size="icon">
                  <Plus
                    className={cn(
                      'h-7 w-7 transition-transform',
                      dialOpened && 'rotate-45',
                    )}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal container={dialContainerRef.current}>
                <DropdownMenuContent align="end" className="px-2.5 py-2">
                  <DropdownMenuItem onClick={() => onCreateJobClick()}>
                    <JobBubbleIcon className="mr-2 h-4 w-4" />
                    <span>
                      <FormattedMessage id="create-job" />
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCreateInboxClick()}>
                    <ChatBubbleIcon className="mr-2 h-4 w-4" />
                    <span>
                      <FormattedMessage id="create-inbox" />
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu> */}
          </div>
          <EditInboxNameDialog
            inboxId={isEditInboxNameDialogOpened.inboxId || ''}
            name={isEditInboxNameDialogOpened.name}
            onCancel={() => closeEditInboxNameDialog()}
            onSaved={() => closeEditInboxNameDialog()}
            open={isEditInboxNameDialogOpened.isOpened}
          />
        </>
      )}
    </div>
  );
};
